<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { SupabaseClient } from '@supabase/supabase-js';
	type SearchProductsResult = Database['public']['Functions']['search_products']['Returns'];
	//Components

	import HeaderSearch from './layout-header-search.svelte';
	import HeaderShoppingCart from './layout-header-shopping-cart.svelte';
	//Icons
	import SidebarIcon from '@lucide/svelte/icons/sidebar';
	import type { Database } from '$lib/types/supabase.types';
	import ky from 'ky';

	interface Props {
		supabase: SupabaseClient<Database>;
	}

	let { supabase }: Props = $props();

	// Search functionality
	let searchTerm = $state('');
	let searchResults = $state<SearchProductsResult>([]);
	let dialogOpen = $state(false);

	const sidebar = Sidebar.useSidebar();
</script>

<header
	class="sticky top-0 z-50 grid h-(--header-height) w-full grid-cols-[auto_auto_1fr_auto] items-center gap-2 border-b bg-background"
>
	<div class="flex w-(--sidebar-width-icon) items-center justify-center border-r">
		<Button class="size-8" variant="ghost" size="icon" onclick={sidebar.toggle}>
			<SidebarIcon />
		</Button>
	</div>
	<p class="flex items-center gap-x-1.5 font-mono text-2xl font-bold">KALISI</p>
	<!-- <Separator orientation="vertical" class="mr-2 h-4" /> -->
	<div></div>
	<div class="flex w-full items-center gap-2 pr-4 pl-2">
		<HeaderSearch class="w-full sm:ml-auto sm:w-auto" />
		<HeaderShoppingCart {supabase} />
	</div>
</header>
