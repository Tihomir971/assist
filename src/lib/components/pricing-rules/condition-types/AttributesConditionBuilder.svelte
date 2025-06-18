<script lang="ts">
	import type { AttributeCondition } from '$lib/types/pricing-rules.types';
	import type { AttributeLookup, AttributeService } from '$lib/services/supabase/attribute.service';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import SmartSelect from '$lib/components/forms/fields/SmartSelect.svelte';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import { onMount } from 'svelte';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import type { Database } from '$lib/types/supabase.types';

	interface Props {
		attributes: AttributeCondition[] | undefined;
		attributesLookup: AttributeLookup[];
		onAttributesChange: (attributes: AttributeCondition[]) => void;
		supabase: SupabaseClient<Database>;
	}

	let {
		attributes = $bindable([]),
		attributesLookup,
		onAttributesChange,
		supabase
	}: Props = $props();

	let attributeServiceInstance: AttributeService | undefined = $state();

	onMount(() => {
		import('$lib/services/supabase/attribute.service').then((module) => {
			attributeServiceInstance = new module.AttributeService(supabase);
		});
	});

	let attributeItemOptions: Array<Array<{ value: number; label: string }>> = $state([]);
	let lastLoadedAttributeIds: (number | undefined)[] = $state([]);

	async function loadAttributeOptions(attributeId: number, itemIndex: number) {
		if (!attributeId || !attributeServiceInstance) {
			if (itemIndex < attributeItemOptions.length) {
				attributeItemOptions[itemIndex] = [];
			}
			return;
		}
		try {
			const options = await attributeServiceInstance.getAttributeOptions(attributeId);
			if (itemIndex < attributeItemOptions.length) {
				attributeItemOptions[itemIndex] = options;
			}
		} catch (error) {
			console.error(`Failed to load options for attribute ${attributeId}:`, error);
			if (itemIndex < attributeItemOptions.length) {
				attributeItemOptions[itemIndex] = [];
			}
		}
	}

	function addAttribute() {
		const newAttribute: AttributeCondition = {
			attribute_id: 0,
			type: 'options',
			option_ids: []
		};
		onAttributesChange([...(attributes || []), newAttribute]);
		// $effect will handle attributeItemOptions and lastLoadedAttributeIds expansion
	}

	function removeAttribute(index: number) {
		const newAttributes = (attributes || []).filter((_, i) => i !== index);
		onAttributesChange(newAttributes);
		// $effect will handle attributeItemOptions and lastLoadedAttributeIds shrinking
	}

	function updateAttribute(index: number, updates: Partial<AttributeCondition>) {
		const currentAttributes = [...(attributes || [])]; // Create a mutable copy
		if (index < 0 || index >= currentAttributes.length) return;

		const updatedAttribute = { ...currentAttributes[index], ...updates };

		// If type changed, adjust other fields
		if ('type' in updates) {
			if (updates.type === 'number') {
				updatedAttribute.option_ids = undefined;
			} else if (updates.type === 'options') {
				updatedAttribute.min_value = undefined;
				updatedAttribute.max_value = undefined;
				updatedAttribute.exact_value = undefined;
			}
		}
		// If attribute_id changed, reset option_ids
		if (
			'attribute_id' in updates &&
			updates.attribute_id !== currentAttributes[index].attribute_id
		) {
			updatedAttribute.option_ids = [];
		}

		currentAttributes[index] = updatedAttribute;
		onAttributesChange(currentAttributes);
		// $effect will handle loading options if attribute_id changed
	}

	$effect(() => {
		const currentAttributes = attributes || [];
		const newLength = currentAttributes.length;

		// Synchronize attributeItemOptions length
		if (attributeItemOptions.length !== newLength) {
			const oldOptionsLength = attributeItemOptions.length;
			attributeItemOptions.length = newLength;
			if (newLength > oldOptionsLength) {
				for (let i = oldOptionsLength; i < newLength; i++) {
					attributeItemOptions[i] = [];
				}
			}
		}

		// Synchronize lastLoadedAttributeIds length
		if (lastLoadedAttributeIds.length !== newLength) {
			const oldLoadedIdsLength = lastLoadedAttributeIds.length;
			lastLoadedAttributeIds.length = newLength;
			if (newLength > oldLoadedIdsLength) {
				for (let i = oldLoadedIdsLength; i < newLength; i++) {
					lastLoadedAttributeIds[i] = undefined;
				}
			}
		}

		currentAttributes.forEach((attr, i) => {
			const currentAttrId = attr.attribute_id;
			const lastLoadedId = lastLoadedAttributeIds[i];

			if (currentAttrId && currentAttrId !== lastLoadedId) {
				loadAttributeOptions(currentAttrId, i);
				lastLoadedAttributeIds[i] = currentAttrId;
			} else if (!currentAttrId && lastLoadedId !== undefined) {
				attributeItemOptions[i] = []; // Clear options if attribute_id is removed
				lastLoadedAttributeIds[i] = undefined;
			}
		});

		// Cleanup if attributes becomes undefined/null
		if (!attributes && (attributeItemOptions.length > 0 || lastLoadedAttributeIds.length > 0)) {
			attributeItemOptions = [];
			lastLoadedAttributeIds = [];
		}
	});

	function toNumber(value: unknown): number | undefined {
		if (value === null || value === undefined || value === '') return undefined;
		const num = Number(value);
		return isNaN(num) ? undefined : num;
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<Label>Uslovi po atributima proizvoda</Label>
		<Button variant="outline" size="sm" onclick={addAttribute}>
			<Plus class="mr-2 h-4 w-4" />
			Dodaj uslov za atribut
		</Button>
	</div>

	{#if !attributes || attributes.length === 0}
		<p class="text-sm text-muted-foreground italic">Nema definisanih uslova za atribute.</p>
	{/if}

	<div class="space-y-4">
		{#each attributes || [] as attribute, index (index)}
			{@const currentItemOptions = attributeItemOptions[index] || []}
			<div class="space-y-4 rounded-lg border bg-background p-4 shadow-sm">
				<div class="flex items-center justify-between">
					<h4 class="text-sm font-semibold text-foreground">Uslov za atribut #{index + 1}</h4>
					<Button
						variant="ghost"
						size="icon"
						onclick={() => removeAttribute(index)}
						title="Ukloni ovaj uslov za atribut"
					>
						<Trash2 class="h-4 w-4 text-destructive" />
					</Button>
				</div>

				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label for={`attribute_id_${index}`}>Izaberi atribut</Label>
						<Select.Root
							type="single"
							name={`attribute_id_${index}`}
							value={attribute.attribute_id ? String(attribute.attribute_id) : undefined}
							onValueChange={(v: string | undefined) =>
								updateAttribute(index, {
									attribute_id: v ? Number(v) : 0
									// option_ids will be reset by updateAttribute logic if attribute_id changes
								})}
						>
							<Select.Trigger class="w-full">
								{attributesLookup.find((a) => a.value === attribute.attribute_id)?.label ||
									'Izaberite atribut...'}
							</Select.Trigger>
							<Select.Content>
								{#each attributesLookup as attr_lookup_item (attr_lookup_item.value)}
									<Select.Item
										value={String(attr_lookup_item.value)}
										label={attr_lookup_item.label}
									>
										{attr_lookup_item.label}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>

					<div class="space-y-2">
						<Label for={`attribute_type_${index}`}>Tip uslova</Label>
						<Select.Root
							type="single"
							name={`attribute_type_${index}`}
							value={attribute.type}
							onValueChange={(v_type: string | undefined) => {
								if (v_type === 'options' || v_type === 'number') {
									updateAttribute(index, { type: v_type as 'options' | 'number' });
								}
							}}
						>
							<Select.Trigger class="w-full">
								{attribute.type === 'options' ? 'Specifične opcije' : 'Numerički opseg'}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="options" label="Specifične opcije"
									>Specifične opcije</Select.Item
								>
								<Select.Item value="number" label="Numerički opseg">Numerički opseg</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>
				</div>

				{#if attribute.type === 'options'}
					<div class="space-y-2">
						<Label for={`attribute_options_${index}`}>Izaberi opcije atributa</Label>
						<SmartSelect
							field={{
								name: `attribute_options_${index}`,
								label: 'Opcije',
								type: 'number' as const,
								placeholder: 'Izaberite opcije...',
								options: currentItemOptions,
								required: false,
								validation: {}
							}}
							value={attribute.option_ids?.map(String) ?? []}
							onValueChange={(selectedStringValues: string[] | undefined) => {
								if (selectedStringValues) {
									const numericIds = selectedStringValues.map(Number).filter((id) => !isNaN(id));
									updateAttribute(index, { option_ids: numericIds });
								} else {
									updateAttribute(index, { option_ids: [] });
								}
							}}
						/>
						{#if attribute.attribute_id && currentItemOptions.length === 0 && lastLoadedAttributeIds[index] === attribute.attribute_id}
							<p class="text-xs text-muted-foreground italic">
								Nema dostupnih opcija za izabrani atribut.
							</p>
						{:else if attribute.attribute_id && currentItemOptions.length === 0 && lastLoadedAttributeIds[index] !== attribute.attribute_id}
							<p class="text-xs text-muted-foreground italic">Učitavanje opcija...</p>
						{/if}
					</div>
				{:else if attribute.type === 'number'}
					<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
						<div class="space-y-2">
							<Label for={`min_value_${index}`}>Min. vrednost</Label>
							<Input
								id={`min_value_${index}`}
								type="number"
								value={attribute.min_value ?? ''}
								oninput={(e) =>
									updateAttribute(index, { min_value: toNumber(e.currentTarget.value) })}
								placeholder="npr. 10"
							/>
						</div>
						<div class="space-y-2">
							<Label for={`max_value_${index}`}>Max. vrednost</Label>
							<Input
								id={`max_value_${index}`}
								type="number"
								value={attribute.max_value ?? ''}
								oninput={(e) =>
									updateAttribute(index, { max_value: toNumber(e.currentTarget.value) })}
								placeholder="npr. 100"
							/>
						</div>
						<div class="space-y-2">
							<Label for={`exact_value_${index}`}>Tačna vrednost</Label>
							<Input
								id={`exact_value_${index}`}
								type="number"
								value={attribute.exact_value ?? ''}
								oninput={(e) =>
									updateAttribute(index, { exact_value: toNumber(e.currentTarget.value) })}
								placeholder="npr. 50"
							/>
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>
