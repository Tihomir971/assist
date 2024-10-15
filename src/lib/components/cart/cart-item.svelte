<script lang="ts">
	import type { CartItem } from './types';
	import { Trash, Plus, Minus } from 'phosphor-svelte';
	import { getShoppingCartState } from './cart-state.svelte';

	type Props = {
		cartItem: CartItem;
	};

	let { cartItem }: Props = $props();
	const shoppingCartState = getShoppingCartState();

	function incrementQuantity() {
		shoppingCartState.updateQuantity(cartItem.id, cartItem.quantity + 1);
	}

	function decrementQuantity() {
		if (cartItem.quantity > 1) {
			shoppingCartState.updateQuantity(cartItem.id, cartItem.quantity - 1);
		}
	}
</script>

<div class="flex items-center justify-between rounded-md bg-surface-3 p-2">
	<div class="flex flex-col">
		<span class="text-sm font-medium">{cartItem.name}</span>
	</div>
	<div class="flex items-center space-x-2">
		<button class="bg-surface-4 hover:bg-surface-5 rounded-md p-1" onclick={decrementQuantity}>
			<Minus size={16} />
		</button>
		<span class="text-sm font-medium">{cartItem.quantity}</span>
		<button class="bg-surface-4 hover:bg-surface-5 rounded-md p-1" onclick={incrementQuantity}>
			<Plus size={16} />
		</button>
		<button
			class="rounded-md bg-red-500 p-1 text-white hover:bg-red-600"
			onclick={() => shoppingCartState.remove(cartItem.id)}
		>
			<Trash size={16} />
		</button>
	</div>
</div>
