<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { goto } from '$app/navigation';
	import type { Database } from '$lib/types/supabase.types';
	import { page } from '$app/state';
	type SearchProductsResult = Database['public']['Functions']['search_products']['Returns'];

	interface Props {
		open?: boolean;
		results?: SearchProductsResult;
	}

	let { open = $bindable(false), results = $bindable([]) }: Props = $props();

	function selectProduct(product: (typeof results)[0]) {
		const path = page.url.searchParams;

		if (product.m_product_category_id) {
			path.set('cat', product.m_product_category_id.toString());
		} else {
			path.delete('cat');
		}
		goto(`/catalog/products/edit/${product.id.toString()}?${path.toString()}`, {
			invalidate: ['catalog:products']
		});
		//

		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Content class="max-h-[80vh] max-w-4xl overflow-y-auto">
			<Dialog.Header>
				<Dialog.Title>Search Results</Dialog.Title>
			</Dialog.Header>

			<div class="py-4">
				{#if results.length === 0}
					<div class="flex flex-col items-center justify-center gap-4 py-8 text-center">
						<p class="text-lg font-medium">No products found</p>
						<p class="text-muted-foreground">
							We couldn't find any products matching your search criteria.
						</p>
						<div class="mt-2">
							<p class="text-muted-foreground">Try:</p>
							<ul class="mt-2 list-disc pl-6 text-muted-foreground">
								<li>Checking for spelling errors</li>
								<li>Using fewer or different keywords</li>
								<li>Using a product code (SKU, MPN, or GTIN) if available</li>
							</ul>
						</div>
					</div>
				{:else}
					<table class="w-full">
						<thead>
							<tr class="border-b">
								<th class="p-2 text-left">SKU</th>
								<th class="p-2 text-left">MPN</th>
								<th class="p-2 text-left">Name</th>
							</tr>
						</thead>
						<tbody>
							{#each results as product}
								<tr
									class="border-b transition-colors hover:bg-muted/50 {product.is_active
										? 'cursor-pointer'
										: 'text-muted-foreground'}"
									{...product.is_active ? { onclick: () => selectProduct(product) } : {}}
								>
									<td class="p-2">{product.sku || '-'}</td>
									<td class="p-2">{product.mpn || '-'}</td>
									<td class="p-2">{product.name}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				{/if}
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
