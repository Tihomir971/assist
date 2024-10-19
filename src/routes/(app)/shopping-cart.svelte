<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import PhShoppingCart from '$lib/icons/PhShoppingCart.svelte';
	import { getShoppingCartState } from '$lib/components/cart/cart-state.svelte';
	import CartItems from '$lib/components/cart/cart-items.svelte';
	import type { SupabaseClient } from '@supabase/supabase-js';

	export let supabase: SupabaseClient;
	const shoppingCartState = getShoppingCartState();

	function toggleCart() {
		shoppingCartState.toggleVisibility();
	}
</script>

<Button variant="outline" size="icon" on:click={toggleCart}>
	<PhShoppingCart class="h-4 w-4" />
	{shoppingCartState.items.length}
</Button>

{#if shoppingCartState.isVisible}
	<div
		class="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 sm:items-center"
	>
		<div
			class="h-full max-h-screen w-full overflow-y-auto bg-white shadow-lg sm:h-auto sm:max-h-[90vh] sm:w-[32rem] sm:rounded-lg"
		>
			<CartItems {supabase} {toggleCart} />
		</div>
	</div>
{/if}
