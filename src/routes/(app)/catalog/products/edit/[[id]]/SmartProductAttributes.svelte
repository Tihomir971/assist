<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import type { ActionResult } from '@sveltejs/kit';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { AttributeOptionLookup } from '$lib/services/supabase/attribute-option.service';
	import type { AttributeSetAttributeWithAttribute } from '$lib/services/supabase/attribute-set-attribute.service';
	import { NumberInputZag } from '$lib/components/zag/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import { Badge } from '$lib/components/ui/badge/index.js';

	import type {
		MProductAttributeOptionInsert,
		MProductAttributeValueInsert
	} from '$lib/types/supabase.zod';
	import type { ProductAttributeValue } from '$lib/services/supabase/product-attribute-value.service';
	import type { ProductAttributeOption } from '$lib/services/supabase/product-attribute-option.service';

	type Props = {
		supabase: SupabaseClient;
		productId: number;
		attributeSetId: number | null;
		productAttributeValues: ProductAttributeValue[];
		productAttributeOptions: ProductAttributeOption[];
		attributeSetAttributes: AttributeSetAttributeWithAttribute[];
		attributeOptionsLookup: Map<number, AttributeOptionLookup[]>;
		lookupData: {
			attributeGroups: { value: number; label: string }[];
		};
		formProductAttributeValue: SuperValidated<MProductAttributeValueInsert>;
		formProductAttributeOption: SuperValidated<MProductAttributeOptionInsert>;
	};

	let {
		productId,
		attributeSetId,
		productAttributeValues,
		productAttributeOptions,
		attributeSetAttributes,
		attributeOptionsLookup,
		lookupData
	}: Props = $props();

	let editingAttributeId = $state<number | null>(null);
	let selectedOptionValue = $state<string>('');
	let selectedMultiOptionValues = $state<string[]>([]);

	function startEditing(
		attributeId: number,
		currentOptionIds?: number[],
		isMultiSelect: boolean = false
	) {
		editingAttributeId = attributeId;
		if (isMultiSelect) {
			selectedMultiOptionValues = (currentOptionIds || []).map(String);
			selectedOptionValue = '';
		} else {
			selectedOptionValue = currentOptionIds?.[0]?.toString() || '';
			selectedMultiOptionValues = [];
		}
	}

	const formEnhance = () => {
		return async ({ result }: { result: ActionResult }) => {
			if (result.type === 'success') {
				await invalidate('catalog:product');
				editingAttributeId = null;
			}
		};
	};

	function getExistingValue(attributeId: number) {
		return productAttributeValues.find((v) => v.attribute_id === attributeId);
	}

	function getExistingOptions(attributeId: number): ProductAttributeOption[] {
		return productAttributeOptions.filter((o) => o.attribute_id === attributeId);
	}

	function getValueForAttr(attribute: AttributeSetAttributeWithAttribute) {
		const existingValue = getExistingValue(attribute.attribute_id);
		if (!existingValue) return null;

		switch (attribute.m_attribute.attribute_type) {
			case 'text':
				return existingValue.text_value;
			case 'number':
				return existingValue.number_value;
			case 'boolean':
				return existingValue.boolean_value;
			case 'date':
				return existingValue.date_value;
			default:
				return null;
		}
	}

	const groupedAttributes = $derived.by(() => {
		const groups = new Map<
			number,
			{ name: string; attributes: AttributeSetAttributeWithAttribute[] }
		>();
		for (const attr of attributeSetAttributes) {
			const groupId = attr.m_attribute.attribute_group_id;
			if (groupId === null || groupId === undefined) continue;

			if (!groups.has(groupId)) {
				const groupName =
					lookupData.attributeGroups.find((g) => g.value === groupId)?.label ?? 'Unknown Group';
				groups.set(groupId, { name: groupName, attributes: [] });
			}
			groups.get(groupId)?.attributes.push(attr);
		}
		return Array.from(groups.values());
	});
</script>

<div class="space-y-4">
	{#if !attributeSetId}
		<p class="text-muted-foreground">Please select an attribute set for this product first.</p>
	{:else}
		<h3 class="text-lg font-medium">Product Attributes</h3>
		<div class="space-y-2">
			{#each groupedAttributes as group (group.name)}
				<Collapsible.Root class="w-full" open>
					<Collapsible.Trigger
						class="flex w-full items-center justify-between rounded-md bg-muted px-4 py-2 font-medium"
					>
						{group.name}
						<ChevronsUpDown class="h-4 w-4" />
					</Collapsible.Trigger>
					<Collapsible.Content class="rounded-md border p-2">
						<table class="w-full text-sm">
							<thead>
								<tr class="border-b *:p-2">
									<th class="text-left font-medium">Attribute</th>
									<th class="text-left font-medium">Value</th>
									<th class="text-left font-medium">UOM</th>
									<th class="text-left font-medium">Properties</th>
									<th class="text-right font-medium">Actions</th>
								</tr>
							</thead>
							<tbody>
								{#each group.attributes as attribute (attribute.id)}
									{@const isSingleSelect = attribute.m_attribute.attribute_type === 'single_select'}
									{@const isMultiSelect = attribute.m_attribute.attribute_type === 'multi_select'}
									{@const isOptionType = isSingleSelect || isMultiSelect}
									{@const existingValueRecord = getExistingValue(attribute.attribute_id)}
									{@const existingOptions = getExistingOptions(attribute.attribute_id)}
									{@const currentValue = getValueForAttr(attribute)}
									{@const currentOptionIds = existingOptions.map((o) => o.option_id)}

									<tr class="border-b *:p-2">
										<td class="font-medium">{attribute.m_attribute.name}</td>
										<td class="text-muted-foreground">
											{#if editingAttributeId === attribute.id}
												{#if isOptionType}
													<form
														method="POST"
														action="?/attributeOptionUpsert"
														use:enhance={formEnhance}
													>
														<input type="hidden" name="product_id" value={productId} />
														<input
															type="hidden"
															name="attribute_id"
															value={attribute.attribute_id}
														/>
														<div class="flex items-center gap-2">
															{#if isSingleSelect}
																<Select.Root
																	type="single"
																	bind:value={selectedOptionValue}
																	name="option_id"
																>
																	<Select.Trigger class="w-48">
																		{selectedOptionValue
																			? attributeOptionsLookup
																					.get(attribute.attribute_id)
																					?.find((o) => o.value.toString() === selectedOptionValue)
																					?.label
																			: '-- Select --'}
																	</Select.Trigger>
																	<Select.Content>
																		<Select.Item value="" label="-- Select --" />
																		{#each attributeOptionsLookup.get(attribute.attribute_id) || [] as option}
																			<Select.Item
																				value={option.value.toString()}
																				label={option.label}
																			/>
																		{/each}
																	</Select.Content>
																</Select.Root>
															{:else if isMultiSelect}
																<Select.Root type="multiple" bind:value={selectedMultiOptionValues}>
																	<Select.Trigger class="w-48">
																		{selectedMultiOptionValues.length > 0
																			? `${selectedMultiOptionValues.length} selected`
																			: '-- Select Multiple --'}
																	</Select.Trigger>
																	<Select.Content>
																		{#each attributeOptionsLookup.get(attribute.attribute_id) || [] as option}
																			<Select.Item
																				value={option.value.toString()}
																				label={option.label}
																			/>
																		{/each}
																	</Select.Content>
																</Select.Root>
																<input type="hidden" name="is_multi_select" value="true" />
																<input
																	type="hidden"
																	name="selected_options"
																	value={JSON.stringify(selectedMultiOptionValues)}
																/>
															{/if}
															<Button type="submit" size="sm">Save</Button>
															<Button
																type="button"
																variant="outline"
																size="sm"
																onclick={() => (editingAttributeId = null)}
															>
																Cancel
															</Button>
														</div>
													</form>
												{:else}
													<form
														method="POST"
														action="?/attributeValueUpsert"
														use:enhance={formEnhance}
													>
														<input type="hidden" name="id" value={existingValueRecord?.id} />
														<input type="hidden" name="product_id" value={productId} />
														<input
															type="hidden"
															name="attribute_id"
															value={attribute.attribute_id}
														/>
														<div class="flex items-center gap-2">
															{#if attribute.m_attribute.attribute_type === 'text'}
																<Input name="text_value" value={(currentValue as string) ?? ''} />
															{:else if attribute.m_attribute.attribute_type === 'number'}
																<NumberInputZag
																	name="number_value"
																	value={currentValue as number | undefined}
																/>
															{:else if attribute.m_attribute.attribute_type === 'boolean'}
																<Checkbox
																	name="boolean_value"
																	checked={currentValue === true}
																	indeterminate={currentValue === null ||
																		currentValue === undefined}
																/>
															{/if}
															<Button type="submit" size="sm">Save</Button>
															<Button
																type="button"
																variant="outline"
																size="sm"
																onclick={() => (editingAttributeId = null)}
															>
																Cancel
															</Button>
														</div>
													</form>
												{/if}
											{:else if isOptionType}
												{#if isMultiSelect}
													{@const selectedLabels = currentOptionIds
														.map(
															(id) =>
																attributeOptionsLookup
																	.get(attribute.attribute_id)
																	?.find((o) => o.value === id)?.label
														)
														.filter(Boolean)
														.join(', ')}
													{selectedLabels || 'Not set'}
												{:else}
													{attributeOptionsLookup
														.get(attribute.attribute_id)
														?.find((o) => o.value === currentOptionIds[0])?.label ?? 'Not Set'}
												{/if}
											{:else if attribute.m_attribute.attribute_type === 'boolean'}
												<Checkbox
													checked={currentValue === true}
													indeterminate={currentValue === null || currentValue === undefined}
													disabled
												/>
											{:else}
												{currentValue ?? 'Not set'}
											{/if}
										</td>
										<td class="text-muted-foreground">
											{attribute.m_attribute.c_uom?.uomsymbol ?? ''}
										</td>
										<td class="text-muted-foreground">
											<div class="flex gap-1">
												{#if attribute.is_required}
													<Badge variant="destructive" class="text-xs">Mandatory</Badge>
												{/if}
												{#if attribute.is_searchable}
													<Badge variant="secondary" class="text-xs">Searchable</Badge>
												{/if}
											</div>
										</td>
										<td class="text-right">
											{#if editingAttributeId !== attribute.id}
												<Button
													variant="ghost"
													size="sm"
													onclick={() =>
														startEditing(attribute.id, currentOptionIds, isMultiSelect)}
												>
													Edit
												</Button>
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</Collapsible.Content>
				</Collapsible.Root>
			{/each}
		</div>
	{/if}
</div>
