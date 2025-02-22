<script lang="ts">
	import type { SupabaseClient } from '@supabase/supabase-js';
	// Utils
	import { getCartContext } from './ctx.svelte';
	import type { Database } from '$lib/types/supabase/database.types';
	// Components
	import { Button } from '$lib/components/ui/button/index.js';
	import CartItem from './cart-item.svelte';
	import ExportDialog from './components/export/ExportDialog.svelte';
	// Icons
	import PhMicrosoftExcelLogo from '~icons/ph/microsoft-excel-logo';

	interface Props {
		supabase: SupabaseClient<Database>;
	}

	let { supabase }: Props = $props();
	const cartService = getCartContext();

	let showVendorDialog = $state(false);

	async function clearCart() {
		await cartService.clearCart();
	}
</script>

<div class="flex h-full flex-col">
	<div class="mb-2 flex items-center gap-2">
		<Button variant="destructive" onclick={clearCart}>Clear All</Button>
		<Button onclick={() => (showVendorDialog = true)}>
			<PhMicrosoftExcelLogo />
			Export to Excel
		</Button>
	</div>
	<div class="h-full overflow-y-auto pr-2">
		{#await cartService.getCartItems() then cartItems}
			{#each cartItems as cartItem}
				<CartItem {cartItem} />
			{/each}
		{:catch error}
			<p>Error: {error.message}</p>
		{/await}
	</div>

	<ExportDialog {supabase} open={showVendorDialog} />
</div>
