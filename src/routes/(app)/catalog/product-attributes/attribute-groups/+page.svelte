<script lang="ts">
	import SmartTable from '$lib/components/forms/SmartTable.svelte';
	import { attributeGroupsTableConfig } from './datatable.config';

	let { data } = $props();
</script>

<SmartTable
	data={data.items}
	config={attributeGroupsTableConfig}
	count={data.count}
	page={data.page}
	perPage={data.perPage}
	deleteForm={data.deleteForm}
	lookupData={data.lookup}
/>
