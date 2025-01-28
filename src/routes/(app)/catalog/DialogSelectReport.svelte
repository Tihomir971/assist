<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label';
	import type { Warehouse } from './columns.svelte';
	import { page } from '$app/state';

	type Props = {
		showReportDialog: boolean;
		warehouses: Warehouse[];
		activeCategory: string | undefined;
	};
	let { showReportDialog = $bindable(false), warehouses, activeCategory }: Props = $props();

	let value = $state('');

	const triggerContent = $derived(
		warehouses.find((w) => w.value === value)?.label ?? 'Select warehouse'
	);

	let report: string | undefined = $state(undefined);
	let includeOutOfStock = $state(false);
</script>

<Dialog.Root bind:open={showReportDialog}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Select Warehouse</Dialog.Title>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<Select.Root type="single" name="warehose" bind:value>
				<Select.Trigger class="w-[180px]">
					{triggerContent}
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						{#each warehouses as warehouse}
							<Select.Item value={warehouse.value} label={warehouse.label}
								>{warehouse.label}</Select.Item
							>
						{/each}
					</Select.Group>
				</Select.Content>
			</Select.Root>
			<Select.Root type="single" bind:value={report}>
				<Select.Trigger class="w-[180px]"
					>{report ? report.toWellFormed() : 'Select report'}</Select.Trigger
				>
				<Select.Content>
					<Select.Item value="inventory">Inventory</Select.Item>
					<Select.Item value="replenish">Replenish</Select.Item>
				</Select.Content>
			</Select.Root>

			{#if report === 'inventory'}
				<div class="flex items-center gap-2">
					<Checkbox id="include-out-of-stock" bind:checked={includeOutOfStock} />
					<Label for="include-out-of-stock">Include out of stock products</Label>
				</div>
			{/if}
		</div>
		<Dialog.Footer>
			<Button
				type="submit"
				disabled={!activeCategory || !value || !report}
				onclick={() => {
					showReportDialog = false;
					window.open(
						`${page.url.origin}/catalog/report/${report}?warehouse=${value}&treeCategory=${activeCategory}&includeOutOfStock=${includeOutOfStock}`,
						'_blank'
					);
				}}
				>Generate Report
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
