<script lang="ts">
	import Header from './Header.svelte';
	import Aside from './Aside.svelte';
	import { setCartContext } from '$lib/components/cart/ctx.svelte';

	let { children, data } = $props();

	setCartContext();
</script>

<svelte:head>
	<title>KALISI Assist</title>
	<meta name="description" content="This is where the description goes for SEO" />
</svelte:head>

<div class="flex h-screen flex-col">
	<Header supabase={data.supabase} profile={data.profile}></Header>
	<div class="flex flex-1 overflow-hidden">
		<Aside></Aside>
		{@render children()}
	</div>
</div>
