<script lang="ts">
	import { browser } from '$app/environment';
	import { formatDateTime } from '$lib/style/locale';

	import * as Card from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import ComboBox2 from '$lib/components/melt/ComboBox2.svelte';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { page } from '$app/stores';
	import { crudProductCategorySchema } from '../zod.schema.js';

	let { data } = $props();

	const formCategory = superForm(data.formCategory, {
		validators: zodClient(crudProductCategorySchema)
	});
	const { form: formCategoryData, enhance: enhanceCategory, message } = formCategory;
</script>

<form method="post" use:enhanceCategory>
	<div class="container grid grid-cols-[2fr_1fr] gap-2 overflow-hidden">
		<Card.Root>
			<input type="number" name="id" bind:value={$formCategoryData.id} hidden />
			<Card.Header>
				<Card.Title>{$formCategoryData.name}</Card.Title>
			</Card.Header>
			<Card.Content>
				{#if $message}
					<h3 class:invalid={$page.status >= 400}>{$message}</h3>
				{/if}
				<Form.Field form={formCategory} name="name">
					<Form.Control let:attrs>
						<Form.Label>Name</Form.Label>
						<Input {...attrs} bind:value={$formCategoryData.name} autocomplete="off" />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field form={formCategory} name="description">
					<Form.Control let:attrs>
						<Form.Label>Description</Form.Label>
						<Textarea {...attrs} bind:value={$formCategoryData.description as string | null} />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field form={formCategory} name="parent_id">
					<Form.Control let:attrs>
						<Form.Label>Parent Category</Form.Label>
						<ComboBox2
							{...attrs}
							options={data.categories}
							bind:value={$formCategoryData.parent_id}
						/>
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				{JSON.stringify($formCategoryData.parent_id)}
			</Card.Content>
			<Card.Footer class="flex justify-between">
				{#if $formCategoryData.id}
					<Form.Button
						variant="destructive"
						name="delete"
						onclick={(
							e: MouseEvent & {
								currentTarget: EventTarget & HTMLButtonElement;
							}
						) => !confirm('Are you sure?') && e.preventDefault()}>Delete</Form.Button
					>
				{/if}
				<Form.Button>Save</Form.Button>
				{#if browser}
					<SuperDebug data={$formCategoryData} />
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
					<Input value={$formCategoryData.id} readonly />
				</div>
				<div class="grid grid-cols-[1fr_2fr] items-center">
					<Label>Created</Label>
					<Input type="text" value={formatDateTime($formCategoryData.created)} readonly />
				</div>
				<div class="grid grid-cols-[1fr_2fr] items-center">
					<Label>Updated</Label>
					<Input type="text" value={formatDateTime($formCategoryData.updated)} readonly />
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</form>
<!-- <Form data={form} categories={data.categories} /> -->
