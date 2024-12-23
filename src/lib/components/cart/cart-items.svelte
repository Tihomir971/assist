<script lang="ts">
	import PhMicrosoftExcelLogo from 'phosphor-svelte/lib/MicrosoftExcelLogo';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Minus from 'phosphor-svelte/lib/Minus';
	import Plus from 'phosphor-svelte/lib/Plus';
	import Trash from 'phosphor-svelte/lib/Trash';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import type { Database } from '$lib/types/supabase';
	import { getCartContext } from './ctx.svelte';
	import { processExport } from './export-utils';

	interface Props {
		supabase: SupabaseClient<Database>;
	}

	let { supabase }: Props = $props();
	const cartStorageCtx = getCartContext();

	let showVendorDialog = $state(false);

	let selectReportValue = $state<string | undefined>(undefined);
	const selectReportOptions = [
		{ value: 'sales_action', label: 'Definisanje prodajnih akcija' },
		{ value: 'internal_transfer', label: 'Interni račun robe' },
		{ value: 'vendor_orders', label: 'Nardžbine dobavljačima' }
	];
	const selectReportTrigerContent = $derived(
		selectReportOptions.find((f) => f.value === selectReportValue)?.label ?? 'Select report type'
	);

	let vendors = $state([
		{ id: 480, name: 'Agrofina', selected: false },
		{ id: 4, name: 'Mercator', selected: false },
		{ id: 89, name: 'Mivex', selected: false },
		{ id: 2, name: 'Cenoteka', selected: false },
		{ id: 714, name: 'Harizma', selected: false }
	]);

	function clearCart() {
		cartStorageCtx.current = [];
	}

	async function handleExport() {
		const success = await processExport(
			cartStorageCtx.current,
			vendors,
			selectReportValue,
			supabase
		);
		if (success) {
			showVendorDialog = false;
			vendors = vendors.map((v) => ({ ...v, selected: false }));
		}
	}
</script>

<div class="flex h-full flex-col">
	<div class="mb-2 flex items-center gap-2">
		<Button variant="destructive" onclick={clearCart}>Clear All</Button>
		<Button onclick={() => (showVendorDialog = true)}>
			<PhMicrosoftExcelLogo size={20} />
			Export to Excel
		</Button>
	</div>
	<div class="h-full overflow-y-auto pr-2">
		{#each cartStorageCtx.current as cartItem}
			<div
				class="bg-surface-3 mb-2 flex flex-col items-start justify-between rounded-md p-3 sm:flex-row sm:items-center"
			>
				<div class="mb-2 flex flex-col sm:mb-0">
					<span class="text-sm font-medium">{cartItem.name}</span>
					<span class="text-xs text-gray-500">SKU: {cartItem.sku}</span>
				</div>
				<div class="flex items-center space-x-2">
					<Button
						size="icon"
						variant="ghost"
						onclick={() => {
							const index = cartStorageCtx.current.findIndex((item) => item.id === cartItem.id);
							if (index !== -1 && cartItem.quantity > 1) {
								cartStorageCtx.current = [
									...cartStorageCtx.current.slice(0, index),
									{
										...cartStorageCtx.current[index],
										quantity: cartStorageCtx.current[index].quantity - 1
									},
									...cartStorageCtx.current.slice(index + 1)
								];
							}
						}}
					>
						<Minus size={14} />
					</Button>
					<span class="w-8 text-center text-sm font-medium">{cartItem.quantity}</span>
					<Button
						size="icon"
						variant="ghost"
						onclick={() => {
							const index = cartStorageCtx.current.findIndex((item) => item.id === cartItem.id);
							if (index !== -1) {
								cartStorageCtx.current = [
									...cartStorageCtx.current.slice(0, index),
									{
										...cartStorageCtx.current[index],
										quantity: cartStorageCtx.current[index].quantity + 1
									},
									...cartStorageCtx.current.slice(index + 1)
								];
							}
						}}
					>
						<Plus size={14} />
					</Button>
					<Button
						size="icon"
						variant="destructive"
						onclick={() => {
							const index = cartStorageCtx.current.findIndex((item) => item.id === cartItem.id);
							if (index !== -1) {
								cartStorageCtx.current = [
									...cartStorageCtx.current.slice(0, index),
									...cartStorageCtx.current.slice(index + 1)
								];
							}
						}}
					>
						<Trash size={14} />
					</Button>
				</div>
			</div>
		{/each}
	</div>

	<Dialog.Root open={showVendorDialog}>
		<Dialog.Content class="w-full max-w-sm sm:max-w-md">
			<Dialog.Header>
				<Dialog.Title>Select Vendors</Dialog.Title>
				<Dialog.Description>
					Choose the vendors whose prices and product numbers you want to include in the export.
				</Dialog.Description>
			</Dialog.Header>
			<Select.Root type="single" bind:value={selectReportValue}>
				<Select.Trigger class="w-full">
					{selectReportTrigerContent}
				</Select.Trigger>
				<Select.Content>
					{#each selectReportOptions as reportOption}
						<Select.Item value={reportOption.value} label={reportOption.label}>
							{reportOption.label}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			<div class="flex max-h-[40vh] flex-col space-y-4">
				<div class="flex flex-col space-y-2 overflow-y-auto">
					{#each vendors as vendor}
						<label class="flex items-center space-x-2">
							<Checkbox bind:checked={vendor.selected} />
							<span>{vendor.name}</span>
						</label>
					{/each}
				</div>
			</div>
			<Dialog.Footer>
				<Button onclick={() => (showVendorDialog = false)}>Cancel</Button>
				<Button onclick={handleExport}>Export</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
</div>
