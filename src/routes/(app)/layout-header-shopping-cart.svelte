<script lang="ts">
	import type { Database } from '@tihomir971/assist-shared';
	import type { SupabaseClient } from '@supabase/supabase-js';
	// Icons
	import PhShoppingCart from '~icons/ph/shopping-cart';
	// Componets
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import CartItems from '$lib/components/cart/cart-items.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import { getCartContext } from '$lib/components/cart/ctx.svelte';

	type Props = {
		supabase: SupabaseClient<Database>;
	};
	let { supabase }: Props = $props();

	const cartService = getCartContext();
</script>

<Sheet.Root>
	<Sheet.Trigger class={buttonVariants({ variant: 'ghost', size: 'icon', class: 'relative' })}>
		<PhShoppingCart class="!size-6" />
		{#await cartService.getCartItems() then cartItems}
			{#if cartItems.length > 0}
				<Badge
					class="absolute top-1 right-1 size-4 translate-x-1/3 -translate-y-1/3 justify-center p-0"
				>
					{cartItems.length}
				</Badge>
			{/if}
		{/await}
	</Sheet.Trigger>
	<Sheet.Content class="flex h-full flex-col sm:max-w-2xl">
		<Sheet.Header>
			<Sheet.Title>Shopping Cart</Sheet.Title>
			<Sheet.Description>
				This action cannot be undone. This will permanently delete your account and remove your data
				from our servers.
			</Sheet.Description>
		</Sheet.Header>
		<div class="flex-1 overflow-hidden px-4">
			<CartItems {supabase} />
		</div>
	</Sheet.Content>
</Sheet.Root>
