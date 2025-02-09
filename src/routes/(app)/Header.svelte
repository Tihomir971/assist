<script lang="ts">
	import type { SupabaseClient } from '@supabase/supabase-js';
	//Components
	import { Input } from '$lib/components/ui/input';
	import ShoppingCart from './shopping-cart.svelte';
	import HeaderUserProfile from './header-user-menu.svelte';
	//Icons
	import PhMagnifyingGlass from '~icons/ph/magnifying-glass';

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

<header class="grid w-full grid-cols-3 p-3">
	<div class="flex items-center gap-x-1.5">Bredcrumb</div>
	<div class="relative ml-auto flex-1 md:grow-0">
		<PhMagnifyingGlass class="absolute top-2.5 left-2.5 text-muted-foreground" />
		<Input
			id="searchApp"
			type="search"
			placeholder="Search..."
			class="w-full pl-8  md:w-[200px] lg:w-[336px]"
		/>
	</div>
	<div class="flex items-center justify-end gap-x-3">
		<ShoppingCart {supabase} />
		<HeaderUserProfile {supabase} {profile} />
	</div>
</header>
