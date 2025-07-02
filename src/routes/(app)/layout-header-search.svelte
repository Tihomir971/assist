<script lang="ts">
	import ky from 'ky';
	import SearchIcon from '@lucide/svelte/icons/search';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { HTMLFormAttributes } from 'svelte/elements';
	import type { WithElementRef } from '$lib/utils.js';
	import type { Database } from '@tihomir971/assist-shared';
	import SearchDialog from './search-dialog.svelte';
	type SearchProductsResult = Database['public']['Functions']['search_products']['Returns'];

	let { ref = $bindable(null), ...restProps }: WithElementRef<HTMLFormAttributes> = $props();

	// Search functionality
	let searchTerm = $state('');
	let searchResults = $state<SearchProductsResult>([]);
	let dialogOpen = $state(false);
	const handleSearch = async () => {
		// Only proceed if value is at least 2 characters
		if (searchTerm.length < 2) {
			searchResults = [];
			dialogOpen = false;
			return;
		}

		try {
			const response = await ky
				.get(`/api/search?term=${encodeURIComponent(searchTerm)}`)
				.json<{ products: typeof searchResults }>();
			searchResults = response.products;

			// Always open the dialog, even when there are no results
			dialogOpen = true;
		} catch (error) {
			console.error('Search failed:', error);
			searchResults = [];
			dialogOpen = true; // Show dialog with error message
		}
	};
</script>

<div class="flex items-center gap-4">
	<div class="relative">
		<Label for="search" class="sr-only">Search</Label>
		<Sidebar.Input
			id="search"
			placeholder="Type to search..."
			class="h-8 pl-7"
			bind:value={searchTerm}
			onkeydown={(event: KeyboardEvent) => {
				if (event.key === 'Enter') {
					handleSearch();
				}
			}}
		/>
		<SearchIcon
			class="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none"
		/>
	</div>
</div>

<SearchDialog bind:open={dialogOpen} bind:results={searchResults} />
