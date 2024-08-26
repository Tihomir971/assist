<script lang="ts">
	import type { ShoppingCartSchema } from '$lib/types/zod';
	import PhMinus from '$lib/icons/PhMinus.svelte';
	import PhPlus from '$lib/icons/PhPlus.svelte';
	import PhTrash from '$lib/icons/PhTrash.svelte';
	type Props = {
		cartProduct: ShoppingCartSchema;
		removeItem: (id: number) => void;
	};

	let { cartProduct = $bindable(), removeItem }: Props = $props();
</script>

<div class="flex items-center justify-between border-b border-gray-200 py-2">
	<div class="flex items-center">
		<img
			src={cartProduct.product.imageurl}
			alt="Product"
			class="mr-4 size-12 rounded object-cover"
		/>
		<div>
			<p class="font-medium">{cartProduct.product.name}</p>
			<p class="text-sm">${cartProduct.product.price} each</p>
		</div>
	</div>
	<div class="flex items-center">
		<button
			onclick={() => {
				if (cartProduct.product.quantity === 1) {
					removeItem(cartProduct.id);
				} else {
					cartProduct.product.quantity--;
				}
			}}
			class="rounded p-1 hover:bg-gray-200"
			aria-label="Subtract 1 from quantity"
		>
			<PhMinus class="size-4" />
		</button>
		<span class="mx-2">
			{cartProduct.product.quantity}
		</span>
		<button
			class="rounded p-1 hover:bg-gray-200"
			aria-label="Add 1 to quantity"
			onclick={() => cartProduct.product.quantity++}
		>
			<PhPlus class="size-4" />
		</button>
		<button
			onclick={() => removeItem(cartProduct.id)}
			class="ml-4 rounded p-1 text-red-500 hover:bg-red-100"
		>
			<PhTrash class="size-4" />
		</button>
	</div>
</div>
