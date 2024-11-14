<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import ShoppingCart from 'lucide-svelte/icons/shopping-cart';
	import CartItems from '$lib/components/cart/cart-items.svelte';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import type { CartItem } from '$lib/components/cart/types';
	import { getContext } from 'svelte';
	import type { LocalStorage } from '$lib/storage.svelte';

	type Props = {
		supabase: SupabaseClient;
	};
	let { supabase }: Props = $props();
	let storageCartItems = getContext<LocalStorage<CartItem[]>>('cartItems');
	//const shoppingCartState = new LocalStorage<CartItem[]>('cartItems', []);
	let isCartOpen = $state(false);

	function toggleCart() {
		isCartOpen = !isCartOpen;
	}
</script>

<Button variant="outline" size="icon" onclick={() => (isCartOpen = !isCartOpen)} class="relative">
	<ShoppingCart class="!size-6" />

	{#if storageCartItems.current.length > 0}
		<Badge
			class="absolute top-0 right-0 size-4 -translate-y-1/3 translate-x-1/3 justify-center p-0"
		>
			{storageCartItems.current.length}
		</Badge>
	{/if}
</Button>

{#if isCartOpen}
	<div
		class="bg-opacity-50 fixed inset-0 z-50 flex items-start justify-center bg-black sm:items-center"
	>
		<div
			class="h-full max-h-screen w-full overflow-y-auto bg-white shadow-lg sm:h-auto sm:max-h-[90vh] sm:w-[32rem] sm:rounded-lg"
		>
			<CartItems {supabase} {toggleCart} />
		</div>
	</div>
{/if}
