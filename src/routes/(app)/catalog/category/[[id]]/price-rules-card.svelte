<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { type SuperValidated } from 'sveltekit-superforms';
	import PriceRulesSheet from './price-rules-sheet.svelte';
	import type { Tables } from '$lib/types/supabase.types';
	import { CheckboxZag } from '$lib/components/zag';
	import { getLabelByValue } from '$lib/scripts/custom';
	import PhDotsThreeBold from '~icons/ph/dots-three-bold';
	import type { PriceRulesInsert } from '$lib/types/supabase.zod.schemas-ts';

	type Item = { value: number; label: string };
	type Props = {
		parentId: number | undefined;
		items: Tables<'price_rules'>[];
		validatedForm: SuperValidated<PriceRulesInsert>;
		priceFormulas: Item[];
	};
	let { parentId = $bindable(), items, validatedForm, priceFormulas }: Props = $props();

	let isSheetOpenPriceRules = $state(false);
	let selectedIdPriceRule: number | undefined = $state();
	let selectedPriceRule = $derived.by(() => {
		return items.find((v) => v.id === selectedIdPriceRule);
	});
</script>

<Card.Root class="col-span-2">
	<Card.Header>
		<div class="flex items-center justify-between">
			<Card.Title>Price Rules</Card.Title>
			<Button
				variant="link"
				onclick={() => {
					selectedIdPriceRule = undefined;
					isSheetOpenPriceRules = !isSheetOpenPriceRules;
				}}
			>
				Add
			</Button>
		</div>
	</Card.Header>
	<Card.Content>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-[100px]name">Name</Table.Head>
					<Table.Head>Is Active?</Table.Head>
					<Table.Head>Attribute ID</Table.Head>
					<Table.Head>Price Formula</Table.Head>
					<Table.Head class="w-8"></Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each items as row}
					<Table.Row>
						<Table.Cell class="font-medium">{row.name}</Table.Cell>
						<!-- <Table.Cell>{row.is_active}</Table.Cell> -->
						<Table.Cell><CheckboxZag checked={row.is_active} disabled /></Table.Cell>
						<Table.Cell>{row.m_attribute_id}</Table.Cell>
						<Table.Cell>{getLabelByValue(row.price_formula_id, priceFormulas)}</Table.Cell>
						<Table.Cell>
							<Button
								variant="ghost"
								size="icon"
								onclick={() => {
									selectedIdPriceRule = row.id;
									isSheetOpenPriceRules = !isSheetOpenPriceRules;
								}}
							>
								<PhDotsThreeBold />
							</Button>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</Card.Content>
</Card.Root>

<PriceRulesSheet
	bind:isSheetOpen={isSheetOpenPriceRules}
	bind:item={selectedPriceRule}
	{validatedForm}
	{priceFormulas}
	{parentId}
/>
