<script lang="ts">
	import { browser } from '$app/environment';
	import { formatDateTime } from '$lib/style/locale';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Card from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';

	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/button/button.svelte';
	import { toast } from 'svelte-sonner';
	import { invalidate } from '$app/navigation';
	import { crudMProductCategorySchema } from './schema';

	let { data } = $props();

	const formCategory = superForm(data.formCategory, {
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
	const { form: formData, enhance: enhanceCategory, message, isTainted, tainted } = formCategory;
	let triggerName = $derived(
		data.categories.find((category) => category.value === $formData.parent_id?.toString())?.label
	);
</script>

<form method="post" use:enhanceCategory>
	<div class="container grid grid-cols-[2fr_1fr] gap-2 overflow-hidden">
		<Card.Root>
			<input type="number" name="id" bind:value={$formData.id} hidden />
			<Card.Header>
				<Card.Title>
					<Form.Field form={formCategory} name="name">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Name</Form.Label>
								<Input {...props} bind:value={$formData.name} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-2">
				{#if $message}
					<h3 class:invalid={$page.status >= 400}>{$message}</h3>
				{/if}
				<div class="flex w-full items-center space-x-3">
					<Form.Field
						form={formCategory}
						name="isactive"
						class="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4"
					>
						<Form.Control>
							{#snippet children({ props })}
								<Checkbox {...props} bind:checked={$formData.isactive} />
								<div class="space-y-1 leading-none">
									<Form.Label>Is Active?</Form.Label>
								</div>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field
						form={formCategory}
						name="isactive"
						class="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4"
					>
						<Form.Control>
							{#snippet children({ props })}
								<Checkbox {...props} bind:checked={$formData.isselfservice} />
								<div class="space-y-1 leading-none">
									<Form.Label>Is Self Service?</Form.Label>
								</div>
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>
				<Form.Field form={formCategory} name="description">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Description</Form.Label>
							<Textarea {...props} bind:value={$formData.description} class="resize-y" />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field form={formCategory} name="parent_id">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Parent Category</Form.Label>
							<Select.Root
								type="single"
								value={$formData.parent_id?.toString()}
								name={props.name}
								onValueChange={(v) => {
									$formData.parent_id = Number.parseInt(v);
								}}
							>
								<Select.Trigger {...props}>
									{triggerName}
								</Select.Trigger>
								<Select.Content>
									{#each data.categories as category}
										<Select.Item value={category.value} label={category.label} />
									{/each}
								</Select.Content>
							</Select.Root>
						{/snippet}
					</Form.Control>

					<Form.FieldErrors />
				</Form.Field>
				<div class="flex flex-row-reverse items-center">
					<Form.Button variant="default" disabled={!isTainted($tainted)}>Save</Form.Button>
					<Form.Button
						name="delete"
						variant="destructive"
						onclick={(e) => !confirm('Are you sure?') && e.preventDefault()}>Delete</Form.Button
					>
				</div>
			</Card.Content>
			<Card.Footer class="flex justify-between">
				{#if browser}
					<SuperDebug data={$formData} />
				{/if}
			</Card.Footer>
		</Card.Root>
		<Card.Root>
			<Card.Header>
				<Card.Title>Card Title</Card.Title>
				<Card.Description>Card Description</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-2">
				<div class="grid grid-cols-[1fr_2fr] items-center">
					<Label>ID</Label>
					<Input value={$formData.id} readonly />
				</div>
				<div class="grid grid-cols-[1fr_2fr] items-center">
					<Label>Created</Label>
					<Input type="text" value={formatDateTime($formData.created)} readonly />
				</div>
				<div class="grid grid-cols-[1fr_2fr] items-center">
					<Label>Updated</Label>
					<Input type="text" value={formatDateTime($formData.updated)} readonly />
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</form>
<!-- <Form data={form} categories={data.categories} /> -->
