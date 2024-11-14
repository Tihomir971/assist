<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { formatDateTime, formatNumber } from '$lib/style/locale';

	let { productPurchasing } = $props<{
		productPurchasing: Array<{
			id: number;
			isactive: boolean;
			barcode: string | null;
			c_bpartner_id: number;
			pricelist: number;
			vendorproductno: string;
			url: string | null;
			updated: string;
			c_bpartner: { name: string } | null;
		}>;
	}>();
</script>

<Table.Root>
	<Table.Header>
		<Table.Row>
			<Table.Head>Partner</Table.Head>
			<Table.Head>vendorproductno</Table.Head>
			<Table.Head class="text-right">pricelist</Table.Head>
			<Table.Head>url</Table.Head>
			<Table.Head class="text-right">updated</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each productPurchasing as purchasing}
			<Table.Row>
				<Table.Cell>{purchasing.c_bpartner?.name}</Table.Cell>
				<Table.Cell>{purchasing.vendorproductno}</Table.Cell>
				<Table.Cell class="text-right">{formatNumber(purchasing.pricelist)}</Table.Cell>
				<Table.Cell>{purchasing.url}</Table.Cell>
				<Table.Cell class="text-right">{formatDateTime(purchasing.updated)}</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
