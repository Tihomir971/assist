<script lang="ts">
	import type { SupabaseClient } from '@supabase/supabase-js';
	type SearchProductsResult = Database['public']['Functions']['search_products']['Returns'];
	//Components
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label/index.js';
	import SidebarIcon from '@lucide/svelte/icons/sidebar';
	import ShoppingCart from './shopping-cart.svelte';
	import HeaderUserProfile from './header-user-menu.svelte';
	import SearchDialog from './search-dialog.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import SearchForm from './search-form.svelte';
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
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	const sidebar = Sidebar.useSidebar();
</script>

<header class="sticky top-0 z-50 flex w-full items-center border-b bg-background">
	<div class="flex h-(--header-height) w-full items-center justify-between gap-2 px-4">
		<div class="flex items-center">
			<Button class="size-8" variant="ghost" size="icon" onclick={sidebar.toggle}>
				<SidebarIcon />
			</Button>
			<Separator orientation="vertical" class="mr-2 h-4" />
			<div class="flex items-center gap-x-1.5 text-2xl">KALISI</div>
		</div>
		<div class="flex items-center gap-3">
			<!-- <div class="relative">
				<Label for="searchApp" class="sr-only">Search</Label>
				<Input
					id="searchApp"
					type="search"
					placeholder="Search..."
					class="pl-8"
					bind:value={searchTerm}
					onkeydown={(event: KeyboardEvent) => {
						if (event.key === 'Enter') {
							handleSearch();
						}
					}}
				/>
				<PhMagnifyingGlass
					class="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none"
				/>
			</div> -->
			<div class="flex items-center gap-x-3">
				<SearchForm class="w-full sm:ml-auto sm:w-auto" />
				<ShoppingCart {supabase} />
				<HeaderUserProfile {supabase} {profile} />
			</div>
		</div>
	</div>
</header>

<SearchDialog bind:open={dialogOpen} bind:results={searchResults} />
