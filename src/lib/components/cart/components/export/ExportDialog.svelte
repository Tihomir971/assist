<script lang="ts">
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { processExport } from '../../export-utils';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import type { Database } from '@tihomir971/assist-shared';
	import { getCartContext } from '../../ctx.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { CheckboxZag } from '$lib/components/zag/index.js';

	interface Props {
		supabase: SupabaseClient<Database>;
		open: boolean;
	}

	let { supabase, open = $bindable() }: Props = $props();
	const cartService = getCartContext();

	let selectReportValue = $state<string | undefined>(undefined);
	const selectReportOptions = [
		{ value: 'sales_action', label: 'Definisanje prodajnih akcija' },
		{ value: 'internal_transfer', label: 'Interni račun robe' },
		{ value: 'vendor_orders', label: 'Narudžbine dobavljačima' }
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

	async function handleExport() {
		const cartItems = await cartService.getCartItems();
		const success = await processExport(cartItems, vendors, selectReportValue, supabase);
		if (success) {
			open = false;
			vendors = vendors.map((v) => ({ ...v, selected: false }));
		}
	}
</script>

<Dialog.Root {open}>
	<Dialog.Content class="w-full max-w-sm sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Select Vendors</Dialog.Title>
			<Dialog.Description>
				Choose the vendors whose prices and product numbers you want to include in the export.
			</Dialog.Description>
		</Dialog.Header>
		<Select.Root type="single" allowDeselect={true} bind:value={selectReportValue}>
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
				{#each vendors as vendor (vendor.id)}
					<label class="flex items-center space-x-2">
						<CheckboxZag bind:checked={vendor.selected} label={vendor.name} />
					</label>
				{/each}
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="secondary" onclick={() => (open = false)}>Cancel</Button>
			<Button variant="default" onclick={handleExport}>Export</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
