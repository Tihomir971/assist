<script lang="ts">
	import type { PageData } from './$types';
	import { columns } from './columns';
	import DataTable from './data-table.svelte';

	let { data }: { data: PageData } = $props();
</script>

<DataTable data={data.c_bpartner} {columns} />
