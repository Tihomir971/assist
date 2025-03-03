<script lang="ts">
	import type { SupabaseClient } from '@supabase/supabase-js';
	//Components
	import { Input } from '$lib/components/ui/input';
	import ShoppingCart from './shopping-cart.svelte';
	import HeaderUserProfile from './header-user-menu.svelte';
	import SearchDialog from './search-dialog.svelte';
	//Icons
	import PhMagnifyingGlass from '~icons/ph/magnifying-glass';
	import type { Database } from '$lib/types/supabase/database.types';
	import ky from 'ky';

	interface Props {
		supabase: SupabaseClient<Database>;
		profile: {
			username: string | null;
			full_name: string | null;
			avatar_url: string | null;
		} | null;
	}

	let { supabase, profile }: Props = $props();

	// Search functionality
	let searchTimeout: ReturnType<typeof setTimeout> | null = null;
	let searchResults = $state<
		Array<{
			id: number;
			name: string;
			mpn: string | null;
			gtin: string | null;
			sku: string | null;
			m_product_category_id: number | null;
		}>
	>([]);
	let dialogOpen = $state(false);

	const handleSearch = (event: Event) => {
		const target = event.target as HTMLInputElement;
		const value = target.value;

		// Clear any existing timeout
		if (searchTimeout) clearTimeout(searchTimeout);

		// Set a new timeout
		if (value.length >= 2) {
			searchTimeout = setTimeout(async () => {
				try {
					const response = await ky
						.get(`/api/search?term=${encodeURIComponent(value)}`)
						.json<{ products: typeof searchResults }>();
					searchResults = response.products;
					dialogOpen = searchResults.length > 0;
				} catch (error) {
					console.error('Search failed:', error);
					searchResults = [];
				}
			}, 300); // 300ms debounce
		} else {
			searchResults = [];
			dialogOpen = false;
		}
	};
</script>

<header class="grid w-full grid-cols-3 p-3">
	<div class="flex items-center gap-x-1.5">Kalisi</div>
	<div class="relative ml-auto flex-1 md:grow-0">
		<PhMagnifyingGlass class="absolute top-2.5 left-2.5 text-muted-foreground" />
		<Input
			id="searchApp"
			type="search"
			placeholder="Search..."
			class="w-full pl-8  md:w-[200px] lg:w-[336px]"
			oninput={handleSearch}
		/>
	</div>
	<div class="flex items-center justify-end gap-x-3">
		<ShoppingCart {supabase} />
		<HeaderUserProfile {supabase} {profile} />
	</div>
</header>

<SearchDialog bind:open={dialogOpen} bind:results={searchResults} />
