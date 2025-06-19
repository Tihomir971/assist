<script lang="ts">
	import SmartTable from '$lib/components/forms/SmartTable.svelte';
	import { attributesTableConfig } from './datatable.config';

	let { data } = $props();
</script>

<SmartTable
	data={data.items}
	config={attributesTableConfig}
	count={data.count}
	page={data.page}
	perPage={data.perPage}
	deleteForm={data.deleteForm}
	lookupData={data.lookup}
/>
