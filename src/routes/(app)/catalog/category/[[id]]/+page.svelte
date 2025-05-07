<script lang="ts">
	import { page } from '$app/state';
	import { invalidate } from '$app/navigation';
	import { dev, browser } from '$app/environment';

	// Superforms
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { mProductCategoryInsertSchema } from '$lib/types/supabase.zod.schemas.js';

	import { formatDateTime } from '$lib/style/locale';
	import { toast } from 'svelte-sonner';

	// Components
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { ComboboxZagForm, SwitchZag, SwitchZagForm } from '$lib/components/zag/index.js';
	import { CheckboxZag } from '$lib/components/zag/checkbox/index.js';

	// Icons
	import PhPackage from '~icons/ph/package';

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

<div class="mb-8 grid grid-cols-[3fr_2fr] gap-2 overflow-hidden">
	<Card.Root>
		<form method="POST" use:enhance action="?/categoryUpsert">
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<PhPackage class="mb-2 size-8" />
					<Form.Field form={superform} name="name">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Name</Form.Label>
								<Input {...props} bind:value={$formData.name} class="w-full text-2xl" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-2">
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
{#if browser}
	<Card.Root>
		<Card.Content>
			<SuperDebug data={{ $formData, $errors }} display={dev} />
		</Card.Content>
	</Card.Root>
{/if}
