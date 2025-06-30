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

	import type {
		MProductAttributeOptionInsert,
		MProductAttributeValueInsert
	} from '$lib/types/supabase.zod.schemas.d';
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
		formProductAttributeValue: SuperValidated<MProductAttributeValueInsert>;
		formProductAttributeOption: SuperValidated<MProductAttributeOptionInsert>;
	};

	let {
		productId,
		attributeSetId,
		productAttributeValues,
		productAttributeOptions,
		attributeSetAttributes,
		attributeOptionsLookup
	}: Props = $props();

	let editingAttributeId = $state<number | null>(null);

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

	function getExistingOption(attributeId: number) {
		return productAttributeOptions.find((o) => o.attribute_id === attributeId);
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
</script>

<div class="space-y-4">
	{#if !attributeSetId}
		<p class="text-muted-foreground">Please select an attribute set for this product first.</p>
	{:else}
		<h3 class="text-lg font-medium">Product Attributes</h3>
		<div class="rounded-md border">
			<table class="w-full text-sm">
				<tbody>
					{#each attributeSetAttributes as attribute (attribute.id)}
						{@const isOptionType =
							attribute.m_attribute.attribute_type === 'single_select' ||
							attribute.m_attribute.attribute_type === 'multi_select'}
						{@const existingValueRecord = getExistingValue(attribute.attribute_id)}
						{@const existingOptionRecord = getExistingOption(attribute.attribute_id)}
						{@const currentValue = getValueForAttr(attribute)}
						{@const currentOptionId = existingOptionRecord?.option_id}

						<tr class="border-b">
							<td class="p-4 font-medium">{attribute.m_attribute.name}</td>
							<td class="p-4 text-muted-foreground">
								{#if editingAttributeId === attribute.id}
									{#if isOptionType}
										<form method="POST" action="?/attributeOptionUpsert" use:enhance={formEnhance}>
											<input type="hidden" name="id" value={existingOptionRecord?.id} />
											<input type="hidden" name="product_id" value={productId} />
											<input type="hidden" name="attribute_id" value={attribute.attribute_id} />
											<select name="option_id" class="border p-1">
												<option value="">-- Select --</option>
												{#each attributeOptionsLookup.get(attribute.attribute_id) || [] as option}
													<option value={option.value} selected={option.value === currentOptionId}
														>{option.label}</option
													>
												{/each}
											</select>
											<button type="submit" class="ml-2 rounded bg-blue-500 px-2 py-1 text-white"
												>Save</button
											>
											<button
												type="button"
												onclick={() => (editingAttributeId = null)}
												class="ml-2 rounded bg-gray-300 px-2 py-1">Cancel</button
											>
										</form>
									{:else}
										<form method="POST" action="?/attributeValueUpsert" use:enhance={formEnhance}>
											<input type="hidden" name="id" value={existingValueRecord?.id} />
											<input type="hidden" name="product_id" value={productId} />
											<input type="hidden" name="attribute_id" value={attribute.attribute_id} />

											{#if attribute.m_attribute.attribute_type === 'text'}
												<Input name="text_value" value={(currentValue as string) ?? ''} />
											{:else if attribute.m_attribute.attribute_type === 'number'}
												<NumberInputZag
													name="number_value"
													value={currentValue as number | undefined}
												/>
											{/if}
											<button type="submit" class="ml-2 rounded bg-blue-500 px-2 py-1 text-white"
												>Save</button
											>
											<button
												type="button"
												onclick={() => (editingAttributeId = null)}
												class="ml-2 rounded bg-gray-300 px-2 py-1">Cancel</button
											>
										</form>
									{/if}
								{:else if isOptionType}
									{attributeOptionsLookup
										.get(attribute.attribute_id)
										?.find((o) => o.value === currentOptionId)?.label ?? 'Not Set'}
								{:else}
									{currentValue ?? 'Not set'}
								{/if}
							</td>
							<td class="p-4 text-right">
								{#if editingAttributeId !== attribute.id}
									<button
										onclick={() => (editingAttributeId = attribute.id)}
										class="text-blue-500 hover:underline">Edit</button
									>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
