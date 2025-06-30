<script lang="ts">
	import SmartTable from '$lib/components/forms/SmartTable.svelte';
	import { attributesTableConfig } from './datatable.config';
	import { page } from '$app/state';
	import { toastManager } from '$lib/utils/toast-manager';
	import { replaceState } from '$app/navigation';

	let { data } = $props();

	// Show success toast if redirected after delete
	$effect(() => {
		const urlParams = new URLSearchParams(page.url.search);
		if (urlParams.get('deleted') === 'true') {
			const entity = urlParams.get('entity') || 'item';
			toastManager.showSuccess(
				`${entity.charAt(0).toUpperCase() + entity.slice(1)} deleted successfully!`,
				{
					dedupeKey: `${entity}-delete-redirect-success`
				}
			);

			// Clean up URL parameters using SvelteKit's replaceState
			const newUrl = new URL(page.url);
			newUrl.searchParams.delete('deleted');
			newUrl.searchParams.delete('entity');
			replaceState(newUrl.pathname + newUrl.search, {});
		}
	});
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
