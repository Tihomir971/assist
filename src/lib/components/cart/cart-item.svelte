<script lang="ts">
	import type { CartItem } from './types';
	import PhTrash from '~icons/ph/trash';
	import PhPlus from '~icons/ph/plus';
	import PhMinus from '~icons/ph/minus';
	import { Button } from '$lib/components/ui/button/index.js';
	import { getCartContext } from './ctx.svelte';

	type Props = {
		cartItem: CartItem;
	};

	let { cartItem }: Props = $props();
	const cartService = getCartContext();

	async function incrementQuantity() {
		await cartService.updateItemQuantity(cartItem.id, cartItem.quantity + 1);
	}

	async function decrementQuantity() {
		if (cartItem.quantity > 1) {
			await cartService.updateItemQuantity(cartItem.id, cartItem.quantity - 1);
		}
	}

	async function removeItem() {
		await cartService.removeItem(cartItem.id);
	}
</script>

<div
	class="mb-2 flex flex-col items-start justify-between rounded-md bg-white p-3 sm:flex-row sm:items-center"
>
	<div class="mb-2 flex flex-col sm:mb-0">
		<span class="text-sm font-medium">{cartItem.name}</span>
		<span class="text-xs text-gray-500">SKU: {cartItem.sku}</span>
	</div>
	<div class="flex items-center space-x-2">
		<button class="size-icon variant-ghost" onclick={decrementQuantity}>
			<PhMinus />
		</button>
		<span class="w-8 text-center text-sm font-medium">{cartItem.quantity}</span>
		<button class="size-icon variant-ghost" onclick={incrementQuantity}>
			<PhPlus />
		</button>
		<button class="size-icon variant-destructive" onclick={removeItem}>
			<PhTrash />
		</button>
	</div>
</div>
