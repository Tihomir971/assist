<script lang="ts">
	import Header from './Header.svelte';
	import Aside from './Aside.svelte';
	import { setShoppingCartState } from '$lib/components/cart/cart-state.svelte.js';

	let { children, data } = $props();

	// Set up the shopping cart state
	setShoppingCartState();
</script>

<div class="grid h-screen w-screen grid-rows-[auto_1fr] overflow-hidden">
	<div class="h-full">
		<Header supabase={data.supabase}></Header>
	</div>
	<div class="grid h-full w-full grid-cols-1 overflow-hidden md:grid-cols-[auto_1fr]">
		<div class="hidden md:block">
			<Aside></Aside>
		</div>
		<main class="flex h-full w-full flex-col items-center overflow-hidden p-2">
			{@render children()}
		</main>
	</div>
</div>
