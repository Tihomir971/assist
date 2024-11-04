<script lang="ts">
	import { browser } from '$app/environment';
	import { formatDateTime } from '$lib/style/locale';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Card from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { page } from '$app/stores';
	import { crudProductCategorySchema } from '../zod.schema.js';
	import Button from '$lib/components/ui/button/button.svelte';

	let { data } = $props();

	const formCategory = superForm(data.formCategory, {
		validators: zodClient(crudProductCategorySchema)
	});
	const { form: formCategoryData, enhance: enhanceCategory, message } = formCategory;
	let triggerName = $derived(
		data.categories.find((category) => category.value === $formCategoryData.parent_id?.toString())
			?.label
	);
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
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Name</Form.Label>
							<Input {...props} bind:value={$formCategoryData.name} autocomplete="off" />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field form={formCategory} name="description">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Description</Form.Label>
							<Textarea {...props} bind:value={$formCategoryData.description} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<div>
					<Form.Field form={formCategory} name="parent_id">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Email</Form.Label>
								<Select.Root
									type="single"
									value={$formCategoryData.parent_id?.toString()}
									name={props.name}
									onValueChange={(v) => {
										$formCategoryData.parent_id = Number.parseInt(v);
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
						<Form.Description>
							You can manage email address in your <a href="/examples/forms">email settings</a>.
						</Form.Description>
						<Form.FieldErrors />
					</Form.Field>
					<Button
						variant="default"
						onclick={() => {
							$formCategoryData.parent_id = null;
						}}>Save</Button
					>
				</div>
			</Card.Content>
			<Card.Footer class="flex justify-between">
				{#if $formCategoryData.id}
					<Form.Button
						variant="destructive"
						name="delete"
						onclick={(e) => !confirm('Are you sure?') && e.preventDefault()}>Delete</Form.Button
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
