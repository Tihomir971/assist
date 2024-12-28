<script lang="ts">
	import type { CartItem } from './types';
	import PhTrash from '~icons/ph/trash';
	import PhPlus from '~icons/ph/plus';
	import PhMinus from '~icons/ph/minus';
	import { LocalStorage } from '$lib/storage.svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	type Props = {
		cartItem: CartItem;
	};

	let { cartItem }: Props = $props();
	const storageCartItems = new LocalStorage<CartItem[]>('cartItems', []);

	// Track the current cart items state
	let cartItems = $state(storageCartItems.current);
	function incrementQuantity() {
		const itemIndex = cartItems.findIndex((item) => item.id === cartItem.id);
		if (itemIndex !== -1) {
			cartItems[itemIndex].quantity += 1;
			storageCartItems.current = cartItems;
		}
	}

	function decrementQuantity() {
		if (cartItem.quantity > 1) {
			const itemIndex = cartItems.findIndex((item) => item.id === cartItem.id);
			if (itemIndex !== -1) {
				cartItems[itemIndex].quantity -= 1;
				storageCartItems.current = cartItems;
			}
		}
	}

	// Derive the current quantity for this specific cart item
	let quantity = $derived(
		cartItems.find((item) => item.id === cartItem.id)?.quantity ?? cartItem.quantity
	);
</script>

<div
	class="bg-surface-3 mb-2 flex flex-col items-start justify-between rounded-md p-3 sm:flex-row sm:items-center"
>
	<div class="mb-2 flex flex-col sm:mb-0">
		<span class="text-sm font-medium">{cartItem.name}</span>
		<span class="text-xs text-gray-500">SKU: {cartItem.sku}</span>
	</div>
	<div class="flex items-center space-x-2">
		<Button size="icon" variant="ghost" onclick={decrementQuantity}>
			<PhMinus />
		</Button>
		<span class="w-8 text-center text-sm font-medium">{quantity}</span>
		<Button size="icon" variant="ghost" onclick={incrementQuantity}>
			<PhPlus />
		</Button>
		<Button
			size="icon"
			variant="destructive"
			onclick={() => {
				const index = cartItems.findIndex((item) => item.id === cartItem.id);
				if (index !== -1) {
					cartItems.splice(index, 1);
					storageCartItems.current = cartItems;
				}
			}}
		>
			<PhTrash />
		</Button>
	</div>
</div>
