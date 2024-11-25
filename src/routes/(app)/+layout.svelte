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

<div class="flex h-screen flex-col">
	<Header supabase={data.supabase} profile={data.profile}></Header>
	<div class="flex flex-1 overflow-hidden">
		<Aside></Aside>
		{@render children()}
	</div>
</div>
