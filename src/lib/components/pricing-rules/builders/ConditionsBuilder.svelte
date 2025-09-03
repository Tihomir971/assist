<script lang="ts">
	import type { PricingConditions, AttributeCondition } from '$lib/types/pricing-rules.types';
	import type { PartnerLookup } from '$lib/services/supabase/partner.service';
	import type { TreeStructure } from '$lib/services/supabase/category.service';
	import type { AttributeLookup } from '$lib/services/supabase/attribute.service';
	import type { BrandLookup } from '$lib/services/supabase/brand.service';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import type { Database } from '$lib/types/supabase';

	import * as Card from '$lib/components/ui/card';
	import AttributesConditionBuilder from '../condition-types/AttributesConditionBuilder.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import XIcon from '@lucide/svelte/icons/x';
	import BrandsSelector from '../condition-types/BrandsSelector.svelte';
	import PartnersSelector from '../condition-types/PartnersSelector.svelte';
	import QuantityRangeInputs from '../condition-types/QuantityRangeInputs.svelte';
	import { TreeViewZag } from '$lib/components/zag';

	interface Props {
		conditions: PricingConditions | undefined; // Can be undefined initially
		lookupData: {
			partners: PartnerLookup[];
			categories: TreeStructure[];
			attributes: AttributeLookup[];
			brands: BrandLookup[];
		};
		onConditionsChange: (conditions: PricingConditions) => void;
		supabase: SupabaseClient<Database>; // Required for AttributesConditionBuilder
	}

	let {
		conditions = $bindable({}), // Default to empty object if undefined
		lookupData,
		onConditionsChange,
		supabase
	}: Props = $props();

	// Ensure conditions is always an object for easier partial updates
	let currentConditions = $derived(conditions || {});

	// Helper function to find category by ID for display
	function findCategoryById(categories: TreeStructure[], id: number): TreeStructure | null {
		for (const category of categories) {
			if (category.value === id) return category;
			if (category.children) {
				const found = findCategoryById(category.children, id);
				if (found) return found;
			}
		}
		return null;
	}

	const selectedCategories = $derived(
		(currentConditions.category_ids || [])
			.map((id) => findCategoryById(lookupData.categories, id))
			.filter((cat): cat is TreeStructure => cat !== null)
	);

	function removeCategory(categoryId: number) {
		const newIds = (currentConditions.category_ids || []).filter((id) => id !== categoryId);
		handleCategoriesChange(newIds);
	}

	function updateConditions(updates: Partial<PricingConditions>) {
		onConditionsChange({ ...currentConditions, ...updates });
	}

	// Specific handler for attributes as it's an array
	function handleAttributesChange(newAttributes: AttributeCondition[]) {
		updateConditions({ attributes: newAttributes });
	}

	// Specific handler for category_ids
	function handleCategoriesChange(categoryIds: number[]) {
		updateConditions({ category_ids: categoryIds.length > 0 ? categoryIds : undefined });
	}

	// Specific handler for partner_ids
	function handlePartnersChange(partnerIds: number[]) {
		updateConditions({ partner_ids: partnerIds.length > 0 ? partnerIds : undefined });
	}

	// Specific handler for brand_ids
	function handleBrandsChange(brandIds: number[]) {
		updateConditions({ brand_ids: brandIds.length > 0 ? brandIds : undefined });
	}

	// Specific handler for quantity/order value fields
	function handleQuantityChange(
		quantityUpdates: Pick<PricingConditions, 'min_quantity' | 'max_quantity' | 'min_order_value'>
	) {
		updateConditions(quantityUpdates);
	}
</script>

<div class="space-y-6">
	<Card.Root>
		<Card.Header>
			<Card.Title>Kategorije proizvoda</Card.Title>
			<Card.Description>
				Pravilo će se primeniti samo na proizvode iz izabranih kategorija. Ako su sve kategorije
				ostavljene prazne, ovaj uslov se ne primenjuje.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="space-y-4">
				<div class="rounded-md border">
					<TreeViewZag
						items={lookupData.categories}
						selectionMode="multiple"
						checkedValue={currentConditions.category_ids || []}
						label="Kategorije proizvoda"
						onCheckedChange={(details) => handleCategoriesChange(details.checkedValue.map(Number))}
					/>
				</div>

				{#if selectedCategories.length > 0}
					<div class="flex flex-wrap gap-1">
						{#each selectedCategories as category (category.value)}
							<Badge variant="secondary" class="flex items-center gap-1">
								{category.label}
								<button
									type="button"
									onclick={() => removeCategory(category.value)}
									class="rounded-full hover:bg-muted-foreground/20 focus:outline-none"
									aria-label={`Ukloni kategoriju ${category.label}`}
								>
									<XIcon class="h-3 w-3" />
								</button>
							</Badge>
						{/each}
					</div>
				{/if}

				<p class="text-xs text-muted-foreground">
					Pravilo će se primeniti samo ako proizvod pripada nekoj od izabranih kategorija. Ako
					nijedna kategorija nije izabrana, ovaj uslov se ignoriše.
				</p>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>Brendovi proizvoda</Card.Title>
			<Card.Description>
				Pravilo će se primeniti samo na proizvode izabranih brendova. Ako su svi brendovi ostavljeni
				prazni, ovaj uslov se ne primenjuje.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<BrandsSelector
				selectedBrandIds={currentConditions.brand_ids || []}
				brandsLookup={lookupData.brands}
				onBrandsChange={handleBrandsChange}
			/>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>Partneri</Card.Title>
			<Card.Description>
				Pravilo će se primeniti samo za izabrane partnere. Ako su svi partneri ostavljeni prazni,
				ovaj uslov se ne primenjuje.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<PartnersSelector
				selectedPartnerIds={currentConditions.partner_ids || []}
				partnersLookup={lookupData.partners}
				onPartnersChange={handlePartnersChange}
			/>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>Atributi proizvoda</Card.Title>
			<Card.Description>
				Definišite specifične uslove na osnovu atributa proizvoda i njihovih vrednosti/opcija.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<AttributesConditionBuilder
				attributes={currentConditions.attributes || []}
				attributesLookup={lookupData.attributes}
				onAttributesChange={handleAttributesChange}
				{supabase}
			/>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>Količina i vrednost narudžbe</Card.Title>
			<Card.Description>
				Postavite uslove minimalne/maksimalne količine ili vrednosti narudžbe za primenu pravila.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<QuantityRangeInputs
				minQuantity={currentConditions.min_quantity}
				maxQuantity={currentConditions.max_quantity}
				minOrderValue={currentConditions.min_order_value}
				onQuantityChange={handleQuantityChange}
			/>
		</Card.Content>
	</Card.Root>
</div>
