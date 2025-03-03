<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { goto } from '$app/navigation';

	export let open = false;
	export let results: Array<{
		id: number;
		name: string;
		mpn: string | null;
		gtin: string | null;
		sku: string | null;
		m_product_category_id: number | null;
	}> = [];

	function selectProduct(product: (typeof results)[0]) {
		// Navigate to catalog route with cat parameter AND search parameter
		if (product.m_product_category_id) {
			goto(`/catalog?cat=${product.m_product_category_id}&search=${product.id.toString()}`, {
				replaceState: false
			});
		} else {
			goto(`/catalog?search=${product.id.toString()}`, { replaceState: false });
		}
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Content class="max-h-[80vh] max-w-3xl overflow-y-auto">
			<Dialog.Header>
				<Dialog.Title>Search Results</Dialog.Title>
			</Dialog.Header>

			<div class="py-4">
				{#if results.length === 0}
					<p class="py-8 text-center text-muted-foreground">No products found</p>
				{:else}
					<table class="w-full">
						<thead>
							<tr class="border-b">
								<th class="p-2 text-left">Name</th>
								<th class="p-2 text-left">MPN</th>
								<th class="p-2 text-left">SKU</th>
							</tr>
						</thead>
						<tbody>
							{#each results as product}
								<tr
									class="cursor-pointer border-b transition-colors hover:bg-muted/50"
									onclick={() => selectProduct(product)}
								>
									<td class="p-2">{product.name}</td>
									<td class="p-2">{product.mpn || '-'}</td>
									<td class="p-2">{product.sku || '-'}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				{/if}
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
