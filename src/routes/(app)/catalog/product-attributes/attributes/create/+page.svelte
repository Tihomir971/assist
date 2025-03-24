<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Select from '$lib/components/ui/select/index.js';
	import { superForm } from 'sveltekit-superforms/client';
	import { attributeTypeSchema } from '$lib/types/supabase/supabase-zod-schemas';
	import { Separator } from '$lib/components/ui/separator';
	import type { Enums } from '$lib/types/supabase/database.helper.js';
	import SuperDebug from 'sveltekit-superforms';
	import MySelect from '$lib/components/my/MySelect.svelte';

	const { data } = $props();

	// Define attribute types
	const attributeTypes: Array<Enums<'attribute_type'>> = [
		'single_select',
		'multi_select',
		'text',
		'number',
		'boolean',
		'date'
	];

	// Create form
	const { form, errors, enhance } = superForm(data.form, {
		onResult: ({ result }) => {
			if (result.type === 'redirect') {
				// Redirect will be handled by SvelteKit
			}
		}
	});

	// Options state
	let options = $state([{ name: '', code: '', sort_order: 0, attribute_id: 0 }]);
	let selectedAttributeType = $state($form.attribute_type || 'text');

	// Update form options when options state changes
	$effect(() => {
		$form.options = options;
	});

	// Update selected attribute type when form changes
	$effect(() => {
		selectedAttributeType = $form.attribute_type || '';
	});

	// Add a new option
	function addOption() {
		options = [...options, { name: '', code: '', sort_order: options.length, attribute_id: 0 }];
	}

	// Remove an option
	function removeOption(index: number) {
		options = options.filter((_, i) => i !== index);
		// Update sort_order for remaining options
		options = options.map((option, i) => ({ ...option, sort_order: i }));
	}

	// Get attribute type display name
	function getAttributeTypeDisplay(type: string) {
		switch (type) {
			case 'single_select':
				return 'Single Select';
			case 'multi_select':
				return 'Multi Select';
			case 'text':
				return 'Text';
			case 'number':
				return 'Number';
			case 'boolean':
				return 'Boolean';
			case 'date':
				return 'Date';
			default:
				return type;
		}
	}

	// Check if attribute type is a selection type
	function isSelectionType(type: string) {
		return type === 'single_select' || type === 'multi_select';
	}
</script>

<div class="container mx-auto py-6">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Create Attribute</h1>
		<Button href="/catalog/product-attributes/attributes">Back to List</Button>
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title>Create Attribute</Card.Title>
			<Card.Description>Add a new attribute to the system</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="POST" action="?/create" use:enhance class="space-y-6">
				<!-- Basic Information -->
				<div class="grid gap-6">
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div class="grid gap-2">
							<Label for="name">Name</Label>
							<Input id="name" name="name" bind:value={$form.name} required />
							{#if $errors.name}
								<p class="text-sm text-red-500">{$errors.name}</p>
							{/if}
						</div>

						<div class="grid gap-2">
							<Label for="code">Code</Label>
							<Input id="code" name="code" bind:value={$form.code} required />
							{#if $errors.code}
								<p class="text-sm text-red-500">{$errors.code}</p>
							{/if}
						</div>
					</div>

					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div class="grid gap-2">
							<Label for="attribute_type">Type</Label>
							<Select.Root
								type="single"
								name="attribute_type"
								value={selectedAttributeType}
								onValueChange={(value: string) => {
									selectedAttributeType = value as Enums<'attribute_type'>;
									$form.attribute_type = value as Enums<'attribute_type'>;
								}}
							>
								<Select.Trigger id="attribute_type" name="attribute_type">
									<span>
										{selectedAttributeType
											? getAttributeTypeDisplay(selectedAttributeType)
											: 'Select type'}
									</span>
								</Select.Trigger>
								<Select.Content>
									{#each attributeTypes as type}
										<Select.Item value={type}>{getAttributeTypeDisplay(type)}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
							{#if $errors.attribute_type}
								<p class="text-sm text-red-500">{$errors.attribute_type}</p>
							{/if}
						</div>

						<div class="grid gap-2">
							<MySelect
								name="attribute_group_id"
								label="Group"
								options={data.attributeGroups.map((group) => ({
									value: group.id,
									label: group.name
								}))}
								value={$form.attribute_group_id}
								onValueChange={(value: string) => {
									$form.attribute_group_id = parseInt(value);
									console.log(
										'Selected group ID:',
										$form.attribute_group_id,
										'type:',
										typeof $form.attribute_group_id
									);
								}}
							/>

							{#if $errors.attribute_group_id}
								<p class="text-sm text-red-500">{$errors.attribute_group_id}</p>
							{/if}
						</div>
					</div>

					<div class="grid gap-2">
						<Label for="description">Description</Label>
						<Textarea id="description" name="description" bind:value={$form.description} rows={3} />
						{#if $errors.description}
							<p class="text-sm text-red-500">{$errors.description}</p>
						{/if}
					</div>
				</div>

				<!-- Options for selection types -->
				{#if isSelectionType(selectedAttributeType)}
					<div>
						<Separator class="my-4" />
						<div class="mb-4 flex items-center justify-between">
							<h3 class="text-lg font-medium">Options</h3>
							<Button type="button" variant="outline" size="sm" onclick={addOption}>
								Add Option
							</Button>
						</div>

						{#each options as option, index}
							<div class="mb-4 grid grid-cols-12 gap-4">
								<div class="col-span-5">
									<Label for={`option-name-${index}`}>Name</Label>
									<Input
										id={`option-name-${index}`}
										name={`options[${index}].name`}
										bind:value={option.name}
										required
									/>
								</div>
								<div class="col-span-5">
									<Label for={`option-code-${index}`}>Code</Label>
									<Input
										id={`option-code-${index}`}
										name={`options[${index}].code`}
										bind:value={option.code}
										required
									/>
								</div>
								<div class="col-span-1">
									<Label for={`option-sort-${index}`}>Order</Label>
									<Input
										id={`option-sort-${index}`}
										name={`options[${index}].sort_order`}
										type="number"
										bind:value={option.sort_order}
									/>
								</div>
								<div class="col-span-1 flex items-end">
									<Button
										type="button"
										variant="destructive"
										size="icon"
										class="h-10 w-10"
										onclick={() => removeOption(index)}
										disabled={options.length <= 1}
									>
										<span class="sr-only">Remove</span>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
											class="h-4 w-4"
										>
											<path d="M18 6 6 18" />
											<path d="m6 6 12 12" />
										</svg>
									</Button>
								</div>
							</div>
						{/each}
					</div>
				{/if}

				<div class="flex justify-end gap-2">
					<Button type="button" variant="outline" href="/catalog/product-attributes/attributes"
						>Cancel</Button
					>
					<Button type="submit">Create</Button>
				</div>
			</form>
			<SuperDebug data={$form} />
		</Card.Content>
	</Card.Root>
</div>
