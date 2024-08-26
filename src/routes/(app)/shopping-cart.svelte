<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import PhShoppingCart from '$lib/icons/PhShoppingCart.svelte';
	import type { ShoppingCartSchema } from '$lib/types/zod';
	import CartItem from './cart-item.svelte';

	let cartProducts = $state<ShoppingCartSchema[]>([]);

	function removeFromCart(id: number) {
		cartProducts = cartProducts.filter((product) => product.id !== id);
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button builders={[builder]} variant="outline" size="icon">
			<PhShoppingCart class="h-4 w-4" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Label>My Account</DropdownMenu.Label>
		{#each cartProducts as _, i}
			<CartItem bind:cartProduct={cartProducts[i]} removeItem={removeFromCart} />
		{/each}

		<!-- 	//</form> -->
	</DropdownMenu.Content>
</DropdownMenu.Root>
