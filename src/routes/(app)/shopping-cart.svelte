<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import PhShoppingCart from '$lib/icons/PhShoppingCart.svelte';
	import type { ShoppingCartSchema } from '$lib/types/zod';
	//	import CartItem from './cart-item.svelte';
	import { getShoppingCartState } from '$lib/components/cart/cart-state.svelte';
	import { TerminalSquare } from 'lucide-svelte';
	import CartItems from '$lib/components/cart/cart-items.svelte';
	import type { SupabaseClient } from '@supabase/supabase-js';
	//	let cartProducts = $state<ShoppingCartSchema[]>([]);
	const shoppingCartState = getShoppingCartState();
	//	function removeFromCart(id: number) {
	//		cartProducts = cartProducts.filter((product) => product.id !== id);
	//	}
	export let supabase: SupabaseClient;
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button builders={[builder]} variant="outline" size="icon">
			<PhShoppingCart class="h-4 w-4" />
			{shoppingCartState.items.length}
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<CartItems {supabase}></CartItems>
		<!-- {#each shoppingCartState.items as cartItem} -->
		<!-- <CartItem {cartItem}></CartItem> -->
		<!-- <div>{item.name}</div> -->
		<!-- <CartItem bind:cartProduct={cartProducts[i]} removeItem={removeFromCart} /> -->
		<!-- {/each} -->

		<!-- 	//</form> -->
	</DropdownMenu.Content>
</DropdownMenu.Root>
