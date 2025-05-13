<script lang="ts">
	import { dev, browser } from '$app/environment';

	// Superforms
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { mProductCategoryInsertSchema } from '$lib/types/supabase.zod.schemas.js';
	import * as ContextMenu from '$lib/components/zag/context-menu/index.js';
	import { formatDateTime } from '$lib/style/locale';
	import { toast } from 'svelte-sonner';

	// Components
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	import { ComboboxZagForm, SwitchZagForm } from '$lib/components/zag/index.js';

	import InputTextForm from '$lib/components/my/input/input-text-form.svelte';
	import { page } from '$app/state';

	let { data } = $props();

	const superform = superForm(data.formCategory, {
		resetForm: false,
		validators: zodClient(mProductCategoryInsertSchema),
		onUpdated({ form }) {
			if (form.valid) {
				toast.success('Category updated successfully', {
					description: form.message || 'Your changes have been saved.'
				});

				// invalidate('catalog:category');
			} else {
				console.log('form.message', form);

				toast.error('Failed to update category', {
					description: form.message || 'Please check the form for errors'
				});
			}
		}
	});
	const { form: formData, enhance, message, isTainted, tainted, errors } = superform;
</script>

<div class="container mx-auto py-6">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">Edit Category</h1>
			<p class="text-muted-foreground">Update attribute group details</p>
		</div>
		<Button variant="outline" href={`/catalog?${page.url.searchParams}`}>Back to List</Button>
	</div>
	<div class="mb-8 grid grid-cols-[2fr_1fr] gap-2 overflow-hidden">
		<Card.Root>
			<form method="POST" use:enhance action="?/categoryUpsert">
				<Card.Header>
					<Card.Title>Category Detail</Card.Title>
				</Card.Header>
				<Card.Content class="w-full space-y-2">
					<div class="flex items-end space-x-2">
						<InputTextForm {superform} field="name" label="Name" placeholder="Category Name" />
					</div>
					<div class="flex w-full items-center space-x-3">
						<SwitchZagForm {superform} field="is_active" label="Is Active?" />
						<SwitchZagForm {superform} field="is_self_service" label="Is Self Service?" />
					</div>
					<Form.Field form={superform} name="description">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Description</Form.Label>
								<Textarea {...props} bind:value={$formData.description} class="resize-y" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>

					<ComboboxZagForm
						{superform}
						field="parent_id"
						items={data.categories}
						label="Parent Category"
					/>

					<div class="flex flex-row-reverse items-center gap-2">
						<Form.Button variant="default" disabled={!isTainted($tainted)}>Save</Form.Button>
						<Form.Button
							name="delete"
							variant="destructive"
							onclick={(e) => !confirm('Are you sure?') && e.preventDefault()}>Delete</Form.Button
						>
					</div>
				</Card.Content>
				<Card.Footer class="flex justify-between"></Card.Footer>
			</form>
		</Card.Root>
		<Card.Root>
			<Card.Header>
				<Card.Title>Info</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-2">
				<div class="grid grid-cols-[1fr_2fr] items-center">
					<label for="id">ID</label>
					<Input name="id" id="id" value={$formData.id} readonly />
				</div>
				<div class="grid grid-cols-[1fr_2fr] items-center">
					<label for="created">Created</label>
					<Input
						id="created"
						type="text"
						value={formatDateTime($formData.created_at as string)}
						readonly
					/>
				</div>
				<div class="grid grid-cols-[1fr_2fr] items-center">
					<label for="updated">Updated</label>
					<Input id="updated" type="text" value={formatDateTime($formData.updated_at)} readonly />
				</div>
			</Card.Content>
		</Card.Root>
	</div>
	<ContextMenu.Root onSelect={(e) => console.log('Selected', e)}>
		<ContextMenu.Trigger class="rounded border p-2 hover:bg-surface-1">
			Right-click here
		</ContextMenu.Trigger>
		<ContextMenu.Content>
			<ContextMenu.Item value="edit">Edit</ContextMenu.Item>
			<ContextMenu.Item value="duplicate">Duplicate</ContextMenu.Item>
			<ContextMenu.Separator />
			<ContextMenu.Item value="delete" disabled>Delete (Disabled)</ContextMenu.Item>
			<ContextMenu.Item value="export">Export...</ContextMenu.Item>
		</ContextMenu.Content>
	</ContextMenu.Root>
</div>
{#if browser}
	<Card.Root>
		<Card.Content>
			<SuperDebug data={{ $formData, $errors }} display={dev} />
		</Card.Content>
	</Card.Root>
{/if}
