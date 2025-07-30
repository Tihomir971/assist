<script lang="ts">
	import SmartTable from '$lib/components/forms/SmartTable.svelte';
	import { generatedDocumentConfig } from './datatable.config';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<SmartTable
	data={data.items}
	config={generatedDocumentConfig}
	count={data.count}
	page={data.page}
	perPage={data.perPage}
	deleteForm={data.deleteForm}
	lookupData={data.lookup}
/>
