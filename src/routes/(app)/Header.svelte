<script lang="ts">
	import type { SupabaseClient } from '@supabase/supabase-js';
	//Components
	import { Input } from '$lib/components/ui/input';
	import ShoppingCart from './shopping-cart.svelte';
	import HeaderUserProfile from './header-user-menu.svelte';
	//Icons
	import Search from 'lucide-svelte/icons/search';

	interface Props {
		supabase: SupabaseClient;
		profile: {
			username: string | null;
			full_name: string | null;
			avatar_url: string | null;
		} | null;
	}

	let { supabase, profile }: Props = $props();
</script>

<header class="grid w-full grid-cols-3 border-b p-3">
	<div class="flex items-center gap-x-1.5">Bredcrumb</div>
	<div class="relative ml-auto flex-1 md:grow-0">
		<Search class="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
		<Input
			id="searchApp"
			type="search"
			placeholder="Search..."
			class="bg-background w-full rounded-lg pl-8 md:w-[200px] lg:w-[336px]"
		/>
	</div>
	<div class="flex items-center justify-end gap-x-3">
		<ShoppingCart {supabase} />
		<HeaderUserProfile {supabase} {profile} />
	</div>
</header>
