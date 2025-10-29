<script lang="ts">
	import { onMount } from 'svelte';
	import LayoutHeader from './layout-header.svelte';
	import LayoutSidebar from './layout-sidebar.svelte';
	import { setCartContext } from '$lib/components/cart/ctx.svelte';
	import { setAppContext } from '$lib/context';

	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { invalidate } from '$app/navigation';

	let { children, data } = $props();

	// Set contexts immediately during component initialization (before any async operations)
	setCartContext();

	if (data.app) {
		setAppContext(data.app);
	}

	onMount(() => {
		// Subscribe to auth changes and invalidate when user changes
		const {
			data: { subscription }
		} = data.supabase.auth.onAuthStateChange((event, session) => {
			if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
				invalidate('supabase:auth');
				// Also invalidate user preferences when auth state changes
				invalidate('user:preferences');
			}
		});

		return () => subscription.unsubscribe();
	});
</script>

<svelte:head>
	<title>KALISI Assist</title>
	<meta name="description" content="This is where the description goes for SEO" />
</svelte:head>

<div class="flex min-h-screen flex-col [--header-height:calc(--spacing(14))]">
	<Sidebar.Provider open={true} class="flex h-screen  flex-col">
		<!-- <div class="flex h-screen flex-col"> -->
		<LayoutHeader supabase={data.supabase} />
		<!-- <Header supabase={data.supabase} profile={data.profile}></Header> -->
		<!-- <div class="flex flex-1"> -->
		<div class="flex flex-1 overflow-auto">
			<LayoutSidebar profile={data.profile} supabase={data.supabase} />
			{@render children()}
		</div>
	</Sidebar.Provider>
</div>
