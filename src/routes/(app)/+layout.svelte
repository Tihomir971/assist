<script lang="ts">
	import { setContext } from 'svelte';

	import { LocalStorage } from '$lib/storage.svelte';

	import Header from './Header.svelte';
	import Aside from './Aside.svelte';
	type CartItem = {
		id: number;
		name: string;
		quantity: number;
		sku: string;
	};
	let { children, data } = $props();

	const cartItems = new LocalStorage<CartItem[]>('cartItems', []);
	setContext('cartItems', cartItems);
</script>

<div class="grid h-screen w-screen grid-rows-[auto_1fr] overflow-hidden">
	<div class="h-full">
		<Header supabase={data.supabase} profile={data.profile}></Header>
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
