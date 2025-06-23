<script lang="ts">
	import Aside from './Aside.svelte';
	import LayoutHeader from './layout-header.svelte';
	import LayoutSidebar from './layout-sidebar.svelte';
	import { setCartContext } from '$lib/components/cart/ctx.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	let { children, data } = $props();

	setCartContext();
</script>

<svelte:head>
	<title>KALISI Assist</title>
	<meta name="description" content="This is where the description goes for SEO" />
</svelte:head>

<div class="[--header-height:calc(--spacing(14))]">
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
