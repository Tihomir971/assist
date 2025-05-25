<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Select from '$lib/components/ui/select/index.js';
	import { superForm } from 'sveltekit-superforms/client';
	import { Separator } from '$lib/components/ui/separator';
	import { InputTextForm } from '$lib/components/my/input/index.js';
	import { CheckboxZag, SelectZag, SwitchZagForm } from '$lib/components/zag/index.js';

	const { data } = $props();

	// Edit form
	const superform = superForm(data.form, {
		onResult: ({ result }) => {
			if (result.type === 'redirect') {
				// Redirect will be handled by SvelteKit
			}
		}
	});
	const { form, errors, enhance } = superform;

	// Attributes state
	let attributes = $state($form.attributes || []);
	let selectedAttributeId = $state('');

	// Update form attributes when attributes state changes
	$effect(() => {
		$form.attributes = attributes;
	});

	// Add a new attribute
	function addAttribute() {
		if (selectedAttributeId) {
			const attributeId = parseInt(selectedAttributeId);
			const nextSequence =
				attributes.length > 0 ? Math.max(...attributes.map((a) => a.sequence || 0)) + 1 : 0;

			// Check if attribute already exists in the set
			const exists = attributes.some((a) => a.attribute_id === attributeId);
			if (!exists) {
				attributes = [
					...attributes,
					{
						attributeset_id: $form.id,
						attribute_id: attributeId,
						sequence: nextSequence,
						is_required: false,
						is_active: true
					}
				];
				selectedAttributeId = '';
			}
		}
	}

	// Remove an attribute
	function removeAttribute(index: number) {
		attributes = attributes.filter((_, i) => i !== index);
		// Update sequence for remaining attributes
		attributes = attributes.map((attr, i) => ({ ...attr, sequence: i }));
	}

	// Get attribute name by ID
	function getAttributeName(id: number) {
		const attribute = data.allAttributes.find((a) => a.id === id);
		return attribute ? attribute.name : 'Unknown';
	}

	// Get attribute type by ID
	function getAttributeType(id: number) {
		const attribute = data.allAttributes.find((a) => a.id === id);
		return attribute ? attribute.attribute_type : '';
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
</script>

<div class="container mx-auto py-6">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Edit Attribute Set</h1>
		<Button href="/catalog/product-attributes/attribute-sets">Back to List</Button>
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title>Edit Attribute Set</Card.Title>
			<Card.Description>Update attribute set details</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="POST" action="?/update" use:enhance class="space-y-6">
				<!-- Basic Information -->
				<div class="grid gap-6">
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<InputTextForm
							{superform}
							field="name"
							label="Name"
							placeholder="Attribute Set Name"
							required
						/>
						<InputTextForm
							{superform}
							field="code"
							label="Code"
							placeholder="Attribute Set Code"
							required
						/>
					</div>

					<div class="grid gap-2">
						<Label for="description">Description</Label>
						<Textarea id="description" name="description" bind:value={$form.description} rows={3} />
						{#if $errors.description}
							<p class="text-red-500">{$errors.description}</p>
						{/if}
					</div>
					<SwitchZagForm {superform} field="is_active" label="Is Active?" />
				</div>

				<!-- Attributes -->
				<div>
					<Separator class="my-4" />
					<div class="mb-4 flex items-center justify-between">
						<h3 class="text-lg font-medium">Attributes</h3>
						<div class="flex items-center gap-2">
							<!-- <SelectZag bind:value={selectedAttributeId} items={data.allAttributes} placeholder="Select attribute"/> -->
							<Select.Root
								type="single"
								value={selectedAttributeId}
								onValueChange={(value) => {
									selectedAttributeId = value;
								}}
							>
								<Select.Trigger class="w-[250px]">
									<span>
										{selectedAttributeId
											? getAttributeName(parseInt(selectedAttributeId))
											: 'Select attribute'}
									</span>
								</Select.Trigger>
								<Select.Content>
									{#each data.allAttributes as attribute}
										<Select.Item value={attribute.id.toString()}>
											{attribute.name} ({getAttributeTypeDisplay(attribute.attribute_type)})
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onclick={addAttribute}
								disabled={!selectedAttributeId}
							>
								Add Attribute
							</Button>
						</div>
					</div>

					{#if attributes.length > 0}
						<div class="mb-4 grid grid-cols-12 gap-4 font-medium">
							<div class="col-span-4">Name</div>
							<div class="col-span-2">Type</div>
							<div class="col-span-2">Sequence</div>
							<div class="col-span-2">Required</div>
							<div class="col-span-1">Active</div>
							<div class="col-span-1"></div>
						</div>

						{#each attributes as attribute, index}
							<div class="mb-4 grid grid-cols-12 gap-4">
								<input type="hidden" name={`attributes[${index}].id`} value={attribute.id || ''} />
								<input
									type="hidden"
									name={`attributes[${index}].attributeset_id`}
									value={attribute.attributeset_id}
								/>
								<input
									type="hidden"
									name={`attributes[${index}].attribute_id`}
									value={attribute.attribute_id}
								/>

								<div class="col-span-4">
									{getAttributeName(attribute.attribute_id)}
								</div>
								<div class="col-span-2">
									{getAttributeTypeDisplay(getAttributeType(attribute.attribute_id))}
								</div>
								<div class="col-span-2">
									<Input
										id={`attribute-sequence-${index}`}
										name={`attributes[${index}].sequence`}
										type="number"
										bind:value={attribute.sequence}
									/>
								</div>
								<div class="col-span-2 flex items-center">
									<CheckboxZag
										id={`attribute-required-${index}`}
										name={`attributes[${index}].is_required`}
										bind:checked={attribute.is_required}
									/>
								</div>
								<div class="col-span-1 flex items-center">
									<CheckboxZag
										id={`attribute-active-${index}`}
										name={`attributes[${index}].is_active`}
										bind:checked={attribute.is_active}
									/>
								</div>
								<div class="col-span-1 flex items-center">
									<Button
										type="button"
										variant="destructive"
										size="icon"
										class="h-8 w-8"
										onclick={() => removeAttribute(index)}
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
					{:else}
						<div class="py-4 text-center text-gray-500">
							No attributes added to this set. Use the dropdown above to add attributes.
						</div>
					{/if}
				</div>

				<div class="flex justify-end gap-2">
					<Button type="button" variant="outline" href="/catalog/product-attributes/attribute-sets">
						Cancel
					</Button>
					<Button type="submit">Save Changes</Button>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
</div>
