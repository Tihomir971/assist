<script lang="ts">
	import type { SupabaseClient } from '@supabase/supabase-js';
	// Utils
	import { getCartContext } from './ctx.svelte';
	import type { Database } from '@tihomir971/assist-shared';
	import type { CartItem } from './types';
	// Components
	import { Button } from '$lib/components/ui/button/index.js';
	import ExportDialog from './components/export/ExportDialog.svelte';
	// Icons
	import PhMicrosoftExcelLogo from '~icons/ph/microsoft-excel-logo';
	import PhTrash from '~icons/ph/trash';
	import PhPlus from '~icons/ph/plus';
	import PhMinus from '~icons/ph/minus';
	import * as Table from '$lib/components/ui/table/index.js';

	interface Props {
		supabase: SupabaseClient<Database>;
	}

	let { supabase }: Props = $props();
	const cartService = getCartContext();

	let showVendorDialog = $state(false);

	async function clearCart() {
		await cartService.clearCart();
	}

	async function incrementQuantity(cartItem: CartItem) {
		await cartService.updateItemQuantity(cartItem.id, cartItem.quantity + 1);
	}

	async function decrementQuantity(cartItem: CartItem) {
		if (cartItem.quantity > 1) {
			await cartService.updateItemQuantity(cartItem.id, cartItem.quantity - 1);
		}
	}

	async function removeItem(cartItem: CartItem) {
		await cartService.removeItem(cartItem.id);
	}
</script>

<div class="flex h-full flex-col">
	{#await cartService.getCartItems() then cartItems}
		{#if cartItems.length === 0}
			<div class="flex h-32 items-center justify-center text-muted-foreground">
				Your cart is empty
			</div>
		{:else}
			<div class="mb-2 flex items-center justify-end gap-2">
				<Button variant="destructive" onclick={clearCart}>Clear All</Button>
				<Button onclick={() => (showVendorDialog = true)}>
					<PhMicrosoftExcelLogo />
					Export to Excel
				</Button>
			</div>
			<div class="h-full overflow-y-auto">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>SKU</Table.Head>
							<Table.Head>Item</Table.Head>
							<Table.Head class="text-center">Quantity</Table.Head>
							<Table.Head class="text-center">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each cartItems as cartItem}
							<Table.Row>
								<Table.Cell>{cartItem.sku || '-'}</Table.Cell>
								<Table.Cell>{cartItem.name}</Table.Cell>
								<Table.Cell class="text-center">
									<div class="flex items-center justify-center space-x-2">
										<button
											class="size-icon variant-ghost"
											onclick={() => decrementQuantity(cartItem)}
										>
											<PhMinus />
										</button>
										<span class="w-8 text-center font-medium">{cartItem.quantity}</span>
										<button
											class="size-icon variant-ghost"
											onclick={() => incrementQuantity(cartItem)}
										>
											<PhPlus />
										</button>
									</div>
								</Table.Cell>
								<Table.Cell class="text-center">
									<button
										class="size-icon variant-destructive"
										onclick={() => removeItem(cartItem)}
									>
										<PhTrash />
									</button>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		{/if}
	{:catch error}
		<p>Error: {error.message}</p>
	{/await}
</div>

<ExportDialog {supabase} open={showVendorDialog} />
