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

<div
	class="mb-2 flex flex-col items-start justify-between rounded-md bg-surface-3 p-3 sm:flex-row sm:items-center"
>
	<div class="mb-2 flex flex-col sm:mb-0">
		<span class="text-sm font-medium">{cartItem.name}</span>
		<span class="text-xs text-gray-500">SKU: {cartItem.sku}</span>
	</div>
	<div class="flex items-center space-x-2">
		<button class="bg-surface-4 hover:bg-surface-5 rounded-md p-2" onclick={decrementQuantity}>
			<Minus size={14} />
		</button>
		<span class="w-8 text-center text-sm font-medium">{cartItem.quantity}</span>
		<button class="bg-surface-4 hover:bg-surface-5 rounded-md p-2" onclick={incrementQuantity}>
			<Plus size={14} />
		</button>
		<button
			class="rounded-md bg-red-500 p-2 text-white hover:bg-red-600"
			onclick={() => shoppingCartState.remove(cartItem.id)}
		>
			<Trash size={14} />
		</button>
	</div>
</div>
