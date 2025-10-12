<script lang="ts">
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { processExport } from '../../export-utils';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import type { Database } from '$lib/types/supabase.types';
	import { getCartContext } from '../../ctx.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { CheckboxGroupArk } from '$lib/components/ark/checkbox';
	// import { CheckboxArk } from '$lib/components/ark/index.js';

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

	/* 	let vendors = $state([
		{ id: 480, name: 'Agrofina', selected: false },
		{ id: 4, name: 'Idea', selected: false },
		{ id: 89, name: 'Mivex', selected: false },
		{ id: 2, name: 'Cenoteka', selected: false },
		{ id: 714, name: 'Harizma', selected: false }
	]); */
	let vendors = $state([
		{ value: 480, label: 'Agrofina', selected: false },
		{ value: 4, label: 'Idea', selected: false },
		{ value: 89, label: 'Mivex', selected: false },
		{ value: 2, label: 'Cenoteka', selected: false },
		{ value: 714, label: 'Harizma', selected: false }
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
				<CheckboxGroupArk bind:items={vendors} />
				<!-- 	{#each vendors as vendor (vendor.id)}
					<CheckboxArk
						checked={vendor.selected}
						onCheckedChange={(e) => {
							vendor.selected = e.checked as boolean;
						}}
						label={vendor.name}
					/>
				{/each}
				{JSON.stringify(vendors)} -->
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="secondary" onclick={() => (open = false)}>Cancel</Button>
			<Button variant="default" onclick={handleExport}>Export</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
