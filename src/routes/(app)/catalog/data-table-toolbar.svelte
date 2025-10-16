<script lang="ts">
	import type { RowSelectionState, GlobalFilterTableState, Table } from '$lib/components/walker-tx';
	import type { FlattenedProduct } from './columns.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	//Components
	import DataTableHeaderSync from './data-table-header-sync.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as ToggleGroup from '$lib/components/ui/toggle-group/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';

	//Icons
	import PhLetterCircleV from '~icons/ph/letter-circle-v';
	import PhFolders from '~icons/ph/folders';
	import PhCaretDown from '~icons/ph/caret-down';
	import { SelectLookupZag } from '$lib/components/zag';

	type Props = {
		rowSelectionState: RowSelectionState;
		globalFilterTableState: GlobalFilterTableState | undefined;
		table: Table<FlattenedProduct>;
		addToCart: () => void;
		warehouses: Array<{ value: string; label: string }>;
	};
	let {
		table,
		rowSelectionState = $bindable(),
		globalFilterTableState = $bindable(),
		addToCart,
		warehouses
	}: Props = $props();

	function handleSearch(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target) {
			table.setGlobalFilter(target.value);
		}
	}

	// let checkedVat = $derived(page.url.searchParams.get('vat') === 'true');
	// let checkedSubcategories = $derived(page.url.searchParams.get('sub') === 'true');
	const searchParams = page.url.searchParams;
	let inputValueWarehouse = $derived(searchParams.get('wh') ?? '');
	const toggleGroupValue: string[] = [
		...(searchParams.get('vat') === 'true' ? ['vat'] : []),
		...(searchParams.get('sub') === 'true' ? ['sub'] : [])
	];

	const reports = [
		{ value: 'all', label: 'All Products' },
		{ value: 'relocation', label: 'Relocation' },
		{ value: 'replenish', label: 'Replenish' }
	];
	let inputValueReport = $state(page.url.searchParams.get('report') ?? '');

	function handleSalesGraphClick() {
		const selectedSkus = Object.keys(rowSelectionState).join(',');
		if (selectedSkus) {
			window.open(`/report/salesgraph?skus=${selectedSkus}`, '_blank');

			// goto(`/report/salesgraph?skus=${selectedSkus}`);
		}
	}
</script>

<div class="flex items-center justify-between gap-4">
	<Input
		type="search"
		value={globalFilterTableState ?? ''}
		oninput={(e) => {
			const target = e.target as HTMLInputElement;
			if (page.url.searchParams.get('search')) {
				const newUrl = new URL(page.url);
				newUrl.searchParams.delete('search');
				goto(newUrl);
			}

			if (target) {
				table.setGlobalFilter(target.value);
			}
		}}
		placeholder="Filter products..."
		class="max-w-sm"
	/>
	<div class="flex gap-4">
		<Tooltip.Provider>
			<ToggleGroup.Root
				value={toggleGroupValue}
				variant="outline"
				type="multiple"
				onValueChange={(newValue) => {
					const newUrl = new URL(page.url);
					const flags = ['vat', 'sub'];
					flags.forEach((key) => {
						newValue.includes(key)
							? newUrl.searchParams.set(key, 'true')
							: newUrl.searchParams.delete(key);
					});
					goto(newUrl);
				}}
			>
				<Tooltip.Root>
					<Tooltip.Trigger>
						{#snippet child({ props })}
							<ToggleGroup.Item value="sub" aria-label="Toggle Subcategories" {...props}>
								<PhFolders />
							</ToggleGroup.Item>
						{/snippet}
					</Tooltip.Trigger>
					<Tooltip.Content>
						<p>Show Subcategories</p>
					</Tooltip.Content>
				</Tooltip.Root>
				<Tooltip.Root>
					<Tooltip.Trigger>
						{#snippet child({ props })}
							<ToggleGroup.Item value="vat" aria-label="Toggle VAT" {...props}>
								<PhLetterCircleV />
							</ToggleGroup.Item>
						{/snippet}
					</Tooltip.Trigger>
					<Tooltip.Content>
						<p>Show VAT</p>
					</Tooltip.Content>
				</Tooltip.Root>
			</ToggleGroup.Root>
		</Tooltip.Provider>

		<Button variant="outline" onclick={addToCart}>Add to Cart</Button>
		<Button variant="outline" onclick={handleSalesGraphClick}>Sales Graph</Button>
		<SelectLookupZag
			bind:value={inputValueReport}
			items={reports}
			placeholder="Select report"
			onValueChange={(details) => {
				const url = new URL(page.url);
				if (details.value.length === 0) {
					url?.searchParams?.delete('report');
					url?.searchParams?.delete('sub');
				} else {
					url?.searchParams?.set('report', details.value[0]);
				}
				goto(url);
			}}
		/>
		<SelectLookupZag
			value={inputValueWarehouse}
			items={warehouses}
			onValueChange={(details) => {
				if (details.value.length === 0) {
					return;
				}
				const newUrl = new URL(page.url);
				newUrl?.searchParams?.set('wh', details.value[0]);
				goto(newUrl);
			}}
		/>

		<DataTableHeaderSync bind:rowSelectionState />
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="outline">Columns<PhCaretDown class="ml-2" /></Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				{#each table.getAllColumns().filter((col) => col.getCanHide()) as column (column.id)}
					<DropdownMenu.CheckboxItem
						class="capitalize"
						closeOnSelect={false}
						checked={column.getIsVisible()}
						onCheckedChange={(value) => {
							column.toggleVisibility(!!value);
						}}
					>
						{column.id}
					</DropdownMenu.CheckboxItem>
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
</div>
