<script lang="ts">
	import { onMount } from 'svelte';
	import Aside from './Aside.svelte';
	import LayoutHeader from './layout-header.svelte';
	import LayoutSidebar from './layout-sidebar.svelte';
	import { setCartContext } from '$lib/components/cart/ctx.svelte';
	import { LocaleManager, setLocaleManagerContext } from '$lib/stores/locale-manager.svelte';

	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { invalidate } from '$app/navigation';

	let { children, data } = $props();

	setCartContext();

	// Initialize LocaleManager with server data (synchronously)
	if (data.localePreferences && data.session) {
		try {
			// Create LocaleManager instance
			const manager = new LocaleManager(data.supabase, data.session.user.id, {
				preferredDataLocale: data.localePreferences.preferredDataLocale,
				availableLocales: data.localePreferences.availableLocales,
				isLoading: false,
				isUpdating: false,
				lastUpdated: null,
				error: null
			});

			// Set in Svelte context for child components
			setLocaleManagerContext(manager);
		} catch (error) {
			console.error('Failed to initialize LocaleManager:', error);
		}
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
		<div class="flex flex-1 overflow-hidden">
			<!-- <Aside></Aside> -->
			<LayoutSidebar profile={data.profile} supabase={data.supabase} />
			{@render children()}
		</div>
	</Sidebar.Provider>
</div>
