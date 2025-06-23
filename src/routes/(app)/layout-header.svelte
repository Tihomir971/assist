<script lang="ts">
	// import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { SupabaseClient } from '@supabase/supabase-js';
	type SearchProductsResult = Database['public']['Functions']['search_products']['Returns'];
	//Components

	import HeaderSearch from './layout-header-search.svelte';
	import HeaderShoppingCart from './layout-header-shopping-cart.svelte';
	//Icons
	import SidebarIcon from '@lucide/svelte/icons/sidebar';
	import type { Database, TablesUpdate } from '$lib/types/supabase.types';
	import ky from 'ky';

	interface Props {
		supabase: SupabaseClient<Database>;
	}

	let { supabase }: Props = $props();

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
	const sidebar = Sidebar.useSidebar();
</script>

<header class="sticky top-0 z-50 flex w-full items-center border-b bg-background">
	<div class="flex h-(--header-height) w-full items-center gap-2 pr-4 pl-2">
		<Button class="size-8" variant="ghost" size="icon" onclick={sidebar.toggle}>
			<SidebarIcon />
		</Button>
		<Separator orientation="vertical" class="mr-2 h-4" />
		<div class="flex items-center gap-x-1.5 font-mono text-2xl font-bold">KALISI</div>

		<HeaderSearch class="w-full sm:ml-auto sm:w-auto" />
		<HeaderShoppingCart {supabase} />
	</div>
</header>
