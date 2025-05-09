<script lang="ts">
	import type { SupabaseClient } from '@supabase/supabase-js';
	type SearchProductsResult = Database['public']['Functions']['search_products']['Returns'];
	//Components
	import { Input } from '$lib/components/ui/input';
	import ShoppingCart from './shopping-cart.svelte';
	import HeaderUserProfile from './header-user-menu.svelte';
	import SearchDialog from './search-dialog.svelte';
	//Icons
	import PhMagnifyingGlass from '~icons/ph/magnifying-glass';
	import type { Database, TablesUpdate } from '$lib/types/supabase.types';
	import ky from 'ky';

	interface Props {
		supabase: SupabaseClient<Database>;
		profile: TablesUpdate<'ad_user'> | null;
		// {
		// 	username: string | null;
		// 	full_name: string | null;
		// 	avatar_url: string | null;
		// } | null;
	}

	let { supabase, profile }: Props = $props();

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

<header class="grid w-full grid-cols-3 border-b border-surface-1 bg-well-1 p-3">
	<div class="flex items-center gap-x-1.5 text-2xl">KALISI</div>
	<div class="relative ml-auto flex-1 md:grow-0">
		<PhMagnifyingGlass class="absolute top-2.5 left-2.5 text-muted-foreground" />
		<Input
			id="searchApp"
			type="search"
			placeholder="Search..."
			class="w-full pl-8  md:w-[200px] lg:w-[336px]"
			bind:value={searchTerm}
			onkeydown={(event: KeyboardEvent) => {
				if (event.key === 'Enter') {
					handleSearch();
				}
			}}
		/>
	</div>
	<div class="flex items-center justify-end gap-x-3">
		<ShoppingCart {supabase} />
		<HeaderUserProfile {supabase} {profile} />
	</div>
</header>

<SearchDialog bind:open={dialogOpen} bind:results={searchResults} />
