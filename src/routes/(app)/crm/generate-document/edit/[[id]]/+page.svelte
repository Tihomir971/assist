<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Label } from '$lib/components/ui/label';
	import SmartCombobox from '$lib/components/forms/fields/SmartCombobox.svelte';
	import type { PageData, ActionData } from './$types';
	import { superForm } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { docGeneratedDocumentInsertSchema } from '$lib/types/supabase.zod.schemas';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import jsPDF from 'jspdf';
	import html2canvas from 'html2canvas';
	import type { DocTemplateLookupWithSchema } from '$lib/services/supabase/doc-template.service';
	import type { ContextSchemaStructure } from '$lib/types/supabase.zod.schemas';
	import { deleteByIdSchema } from '$lib/types/zod-delete-by-id';

	let { data } = $props<{ data: PageData }>();

	const form = superForm(data.form, {
		id: 'generate-document-form',
		dataType: 'json',
		validators: zod4(docGeneratedDocumentInsertSchema),
		onResult: ({ result }) => {
			if (result.type === 'success') {
				toast.success(
					data.isCreateMode ? 'Document created successfully!' : 'Document updated successfully!'
				);
				if (result.data?.entity?.generated_content) {
					renderedContent = result.data.entity.generated_content;
				}
				if (data.isCreateMode && result.data?.entity?.id) {
					goto(`/crm/generate-document/edit/${result.data.entity.id}`, {
						invalidateAll: true
					});
				}
			} else if (result.type === 'failure') {
				toast.error(result.data?.error || 'An unexpected error occurred.');
			}
			isGenerating = false;
		}
	});

	const { form: formData, enhance } = form;

	const deleteForm = superForm(
		{ id: data.entity?.id },
		{
			id: 'delete-document-form',
			dataType: 'json',
			validators: zod4(deleteByIdSchema),
			onResult: ({ result }) => {
				if (result.type === 'success') {
					toast.success('Document deleted successfully.');
					goto('/crm/generate-document', { invalidateAll: true });
				} else if (result.type === 'failure') {
					toast.error(result.data?.error || 'Failed to delete document.');
				}
			}
		}
	);

	const { form: deleteFormData, enhance: deleteEnhance } = deleteForm;

	let showRenderedDialog = $state(false);
	let renderedContent = $state(data.entity?.generated_content || '');
	let isGenerating = $state(false);
	let printArea: HTMLDivElement | undefined = $state();

	const selectedTemplate = $derived(
		data.lookups.templates.find(
			(t: DocTemplateLookupWithSchema) => t.value === $formData.doc_template_id
		)
	);

	const contextSchema = $derived.by(() => {
		const template = data.lookups.templates.find(
			(t: DocTemplateLookupWithSchema) => t.value === $formData.doc_template_id
		);
		return template?.context_schema || null;
	});

	// Initialize data_context if not already set
	$effect(() => {
		if (!$formData.data_context) {
			$formData.data_context = {};
		}
	});

	function getLookupData(sourceTable: string) {
		// Check if we have lookup data for this source table
		if (data.lookups[sourceTable]) {
			return data.lookups[sourceTable];
		}

		// Fallback to specific known mappings
		switch (sourceTable) {
			case 'c_bpartner':
				return data.lookups.partners || [];
			default:
				return [];
		}
	}

	async function downloadPdf() {
		if (!printArea) return;
		try {
			const canvas = await html2canvas(printArea, { scale: 2, backgroundColor: '#ffffff' });
			const imgData = canvas.toDataURL('image/png');
			const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
			const pdfWidth = pdf.internal.pageSize.getWidth();
			const pdfHeight = pdf.internal.pageSize.getHeight();
			const ratio = canvas.width / canvas.height;
			const width = pdfWidth;
			const height = width / ratio;
			let position = 0;
			let remainingHeight = canvas.height;
			while (remainingHeight > 0) {
				const pageCanvas = document.createElement('canvas');
				pageCanvas.width = canvas.width;
				pageCanvas.height = Math.min(canvas.height, (canvas.width / pdfWidth) * pdfHeight);
				const pageContext = pageCanvas.getContext('2d');
				pageContext?.drawImage(
					canvas,
					0,
					position,
					canvas.width,
					pageCanvas.height,
					0,
					0,
					canvas.width,
					pageCanvas.height
				);
				const pageImgData = pageCanvas.toDataURL('image/png');
				if (position > 0) {
					pdf.addPage();
				}
				pdf.addImage(pageImgData, 'PNG', 0, 0, width, height);
				remainingHeight -= pageCanvas.height;
				position += pageCanvas.height;
			}
			pdf.save('document.pdf');
		} catch (error) {
			console.error('Error generating PDF:', error);
			toast.error('Failed to generate PDF. Please try using the Print option instead.');
		}
	}

	function printDocument() {
		window.print();
	}
</script>

<div class="container mx-auto space-y-6 py-6">
	<h1 class="text-2xl font-bold">
		{data.isCreateMode ? 'Generate New Document' : `Edit Document #${data.entity?.id}`}
	</h1>

	<Card.Root>
		<form method="POST" action="?/upsert" use:enhance>
			<Card.Content class="space-y-4 pt-6">
				<div class="space-y-2">
					<Label>Select Template</Label>
					<SmartCombobox
						options={data.lookups.templates}
						bind:value={$formData.doc_template_id}
						placeholder="Choose a template..."
					/>
				</div>

				{#if contextSchema && contextSchema.roles.length > 0}
					<hr />
					{#each contextSchema.roles as role (role.name)}
						{@const currentValue = $formData.data_context?.[role.name]?.id}
						<div class="space-y-2">
							<Label>{role.label}</Label>
							<SmartCombobox
								options={getLookupData(role.source_table)}
								placeholder={`Select a ${role.label.toLowerCase()}...`}
								value={currentValue}
								onValueChange={(value: number | string | null) => {
									if (!$formData.data_context) {
										$formData.data_context = {};
									}
									if (value && typeof value === 'number') {
										$formData.data_context[role.name] = {
											table: role.source_table,
											id: value
										};
									} else {
										delete $formData.data_context[role.name];
									}
								}}
							/>
						</div>
					{/each}
				{/if}
			</Card.Content>
			<Card.Footer class="flex justify-end">
				<Button type="submit" disabled={!$formData.doc_template_id || isGenerating}>
					{#if isGenerating}
						Generating...
					{:else}
						{data.isCreateMode ? 'Generate Document' : 'Regenerate Document'}
					{/if}
				</Button>
			</Card.Footer>
		</form>
	</Card.Root>

	<div class="flex justify-between">
		<div>
			{#if !data.isCreateMode}
				<form method="POST" action="?/delete" use:deleteEnhance>
					<input type="hidden" name="id" bind:value={$deleteFormData.id} />
					<Button variant="destructive" type="submit">Delete</Button>
				</form>
			{/if}
		</div>
		<Button variant="ghost" type="button" onclick={() => goto('/crm/generate-document')}>
			Back to List
		</Button>
	</div>

	{#if renderedContent}
		<Card.Root>
			<Card.Header>
				<Card.Title>Preview</Card.Title>
			</Card.Header>
			<Card.Content>
				<div
					bind:this={printArea}
					class="printable prose max-w-full flex-grow overflow-auto rounded-md border p-4"
					style="background-color: white; color: black; min-height: 200px;"
				>
					{@html renderedContent}
				</div>
			</Card.Content>
			<Card.Footer class="print:hidden">
				<Button variant="secondary" onclick={printDocument}>Print</Button>
				<Button onclick={downloadPdf} class="ml-2">Download PDF</Button>
			</Card.Footer>
		</Card.Root>
	{/if}
</div>

<Dialog.Root bind:open={showRenderedDialog}>
	<Dialog.Content class="dialog-content flex h-[80vh] max-w-4xl flex-col">
		<Dialog.Header>
			<Dialog.Title>Generated Document</Dialog.Title>
		</Dialog.Header>
		<div
			bind:this={printArea}
			class="printable prose max-w-full flex-grow overflow-auto"
			style="background-color: white; color: black; min-height: 200px; border: none; padding: 8mm; margin: 0;"
		>
			{@html renderedContent}
		</div>
		<Dialog.Footer class="print:hidden">
			<Button variant="outline" onclick={() => (showRenderedDialog = false)}>Close</Button>
			<Button variant="secondary" onclick={printDocument}>Print</Button>
			<Button onclick={downloadPdf}>Download PDF</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<style>
	/* Print styles with aggressive hiding approach */
	@media print {
		/* Hide everything by default */
		:global(body *) {
			visibility: hidden !important;
		}

		/* Show only printable content and its children */
		:global(.printable),
		:global(.printable *) {
			visibility: visible !important;
		}

		/* Position printable content at top of page */
		:global(.printable) {
			position: absolute !important;
			left: 0 !important;
			top: 0 !important;
			width: 100% !important;
			height: auto !important;
			margin: 0 !important;
			padding: 20px !important;
			border: none !important;
			box-shadow: none !important;
			background: white !important;
			color: black !important;
			font-size: 10pt !important;
			line-height: 1.3 !important;
			page-break-inside: avoid;
		}

		/* Remove all backgrounds and shadows */
		:global(*) {
			background: transparent !important;
			box-shadow: none !important;
			text-shadow: none !important;
		}

		/* Ensure printable content has white background */
		:global(.printable) {
			background: white !important;
		}

		/* Ensure text in printable content is black */
		:global(.printable),
		:global(.printable *) {
			color: black !important;
		}

		/* Handle headings in printable content */
		:global(.printable h1) {
			font-size: 14pt !important;
			font-weight: bold !important;
			margin-bottom: 8pt !important;
			margin-top: 0 !important;
		}
		:global(.printable h2) {
			font-size: 12pt !important;
			font-weight: bold !important;
			margin-bottom: 6pt !important;
			margin-top: 8pt !important;
		}
		:global(.printable h3) {
			font-size: 11pt !important;
			font-weight: bold !important;
			margin-bottom: 5pt !important;
			margin-top: 6pt !important;
		}
		:global(.printable h4) {
			font-size: 10pt !important;
			font-weight: bold !important;
			margin-bottom: 4pt !important;
			margin-top: 5pt !important;
		}

		/* Handle paragraphs and lists in printable content */
		:global(.printable p) {
			margin-bottom: 4pt !important;
			margin-top: 0 !important;
		}
		:global(.printable ul),
		:global(.printable ol) {
			margin-bottom: 4pt !important;
			margin-top: 4pt !important;
			padding-left: 15pt !important;
		}
		:global(.printable li) {
			margin-bottom: 2pt !important;
		}
	}
</style>
