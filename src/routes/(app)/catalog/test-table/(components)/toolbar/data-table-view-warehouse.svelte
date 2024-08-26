<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import * as Select from '$lib/components/ui/select/index.js';

	export let warehouses: { value: number; label: string }[];
	export let activeWarehouse: number | undefined;

	function handleWH(id: number) {
		if ($page.url.searchParams.get('wh') !== id.toString() && browser) {
			const newUrl = new URL($page.url);
			newUrl?.searchParams?.set('wh', id.toString());
			goto(newUrl);
		}

		return;
	}
	const selected = warehouses.find((element) => element.value === activeWarehouse);
</script>

<Select.Root {selected}>
	<Select.Trigger class="w-[180px]">
		<Select.Value placeholder="Select Warehouse" />
	</Select.Trigger>
	<Select.Content>
		{#each warehouses as warehouse}
			<Select.Item value={warehouse.value} on:click={() => handleWH(warehouse.value)}
				>{warehouse.label}
			</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
