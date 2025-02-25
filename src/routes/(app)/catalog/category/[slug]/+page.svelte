<script lang="ts">
	import { page } from '$app/state';
	import { invalidate } from '$app/navigation';
	import { browser } from '$app/environment';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	// Superforms
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { crudMProductCategorySchema } from './schema';

	import { formatDateTime } from '$lib/style/locale';
	import { toast } from 'svelte-sonner';
	// Components
	import * as Card from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import ComboboxField from '$lib/components/my/MyComboboxForm.svelte';
	import DrawerCategoryMap from './drawer-category-map.svelte';

	// Icons
	import PhPackage from '~icons/ph/package';

	let { data } = $props();

	const form = superForm(data.formCategory, {
		resetForm: false,
		validators: zodClient(crudMProductCategorySchema),
		onUpdated(event) {
			const { form } = event;
			if (form.valid) {
				toast.success('Category updated successfully', {
					description: form.message || 'Your changes have been saved.'
				});

				invalidate('catalog:category');
			} else {
				console.log('form.message', form);

				toast.error('Failed to update category', {
					description: form.message || 'Please check the form for errors'
				});
			}
		}
	});
	const { form: formData, enhance, message, isTainted, tainted } = form;
	// let triggerName = $derived(
	// data.categories.find((category) => category.value === $formData.parent_id?.toString())?.label
	// );
	let isCategoryMapDrawerOpen = $state(false);
</script>

<form method="POST" use:enhance>
	<div class="grid grid-cols-[2fr_1fr] gap-2 overflow-hidden">
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<PhPackage class="mb-2 size-8" />
					<Form.Field {form} name="name">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Name</Form.Label>
								<Input {...props} bind:value={$formData.name} class="min-w-4xl text-2xl" />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</Card.Title>
				{#if $message}
					<Card.Description>
						<h3 class:invalid={page.status >= 400}>{$message}</h3>
					</Card.Description>{/if}
			</Card.Header>
			<Card.Content class="space-y-2">
				{#if $message}
					<h3 class:invalid={page.status >= 400}>{$message}</h3>
				{/if}
				<div class="flex w-full items-center space-x-3">
					<Form.Field
						{form}
						name="isactive"
						class="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4"
					>
						<Form.Control>
							{#snippet children({ props })}
								<Checkbox {...props} bind:checked={$formData.is_active} />
								<div class="space-y-1 leading-none">
									<Form.Label>Is Active?</Form.Label>
								</div>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field
						{form}
						name="isactive"
						class="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4"
					>
						<Form.Control>
							{#snippet children({ props })}
								<Checkbox {...props} bind:checked={$formData.is_self_service} />
								<div class="space-y-1 leading-none">
									<Form.Label>Is Self Service?</Form.Label>
								</div>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>
				<Form.Field {form} name="description">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Description</Form.Label>
							<Textarea {...props} bind:value={$formData.description} class="resize-y" />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<ComboboxField
					{form}
					name="parent_id"
					label="Parent Category"
					options={data.categories}
					placeholder="Select parent category"
					width="w-full"
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
					<Input
						id="updated"
						type="text"
						value={formatDateTime($formData.updated as string)}
						readonly
					/>
				</div>
			</Card.Content>
		</Card.Root>
		<Button onclick={() => (isCategoryMapDrawerOpen = !isCategoryMapDrawerOpen)}>Drawer</Button>
	</div>
	{#if browser}
		<Card.Root>
			<Card.Content>
				{#if browser}
					<SuperDebug data={$formData} />
				{/if}
			</Card.Content>
		</Card.Root>
	{/if}
</form>
<DrawerCategoryMap
	bind:isCategoryMapDrawerOpen
	categories={data.categories}
	channels={data.channels}
	validatedForm={data.formCategoryMap}
/>
