<script lang="ts">
	import PhShoppingCart from '~icons/ph/shopping-cart';
	import CartItems from '$lib/components/cart/cart-items.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import { getCartContext } from '$lib/components/cart/ctx.svelte';
	import type { Database } from '$lib/types/supabase/database.types';

	type Props = {
		supabase: SupabaseClient<Database>;
	};
	let { supabase }: Props = $props();

	const cartStorageCtx = getCartContext();
</script>

<Sheet.Root>
	<Sheet.Trigger class={buttonVariants({ variant: 'ghost', size: 'icon', class: 'relative' })}>
		<PhShoppingCart class="!size-6" />
		{#if cartStorageCtx.current.length > 0}
			<Badge
				class="absolute top-1 right-1 size-4 -translate-y-1/3 translate-x-1/3 justify-center p-0"
			>
				{cartStorageCtx.current.length}
			</Badge>
		{/if}
	</Sheet.Trigger>
	<Sheet.Content class="flex h-full flex-col sm:max-w-2xl">
		<Sheet.Header>
			<Sheet.Title>Shopping Cart</Sheet.Title>
			<Sheet.Description>
				This action cannot be undone. This will permanently delete your account and remove your data
				from our servers.
			</Sheet.Description>
		</Sheet.Header>
		<div class="flex-1 overflow-hidden">
			<CartItems {supabase} />
		</div>
	</Sheet.Content>
</Sheet.Root>
