<script lang="ts">
	import { getShoppingCartState } from './cart-state.svelte';
	import CartItem from './cart-item.svelte';
	import { utils, writeFile } from 'xlsx';
	import PhMicrosoftExcelLogo from 'phosphor-svelte/lib/MicrosoftExcelLogo';
	import PhX from 'phosphor-svelte/lib/X';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import type { FlattenedProduct, Product } from './types';

	export let supabase: SupabaseClient;
	export let toggleCart: () => void;
	const cartState = getShoppingCartState();

	let showVendorDialog = false;

	let vendors = [
		{ id: 480, name: 'Agrofina', selected: false },
		{ id: 4, name: 'Mercator', selected: false },
		{ id: 89, name: 'Mivex', selected: false },
		{ id: 2, name: 'Cenoteka', selected: false },
		{ id: 407, name: 'Gros', selected: false }
	];

	function clearCart() {
		cartState.clearItems();
	}

	async function fetchProducts(productIds: (string | number)[]): Promise<Product[]> {
		const { data, error } = await supabase
			.from('m_product')
			.select(
				`
				id, sku, name, barcode, mpn, unitsperpack, imageurl, discontinued,
				c_taxcategory(c_tax(rate)),
				m_storageonhand(warehouse_id,qtyonhand),
				productPrice:m_productprice(m_pricelist_version_id,pricestd,pricelist),
				level_min:m_replenish(m_warehouse_id,level_min),
				level_max:m_replenish(m_warehouse_id,level_max),
				m_product_po(c_bpartner_id,pricelist,vendorproductno)
			`
			)
			.in('id', productIds);

		if (error) {
			console.error('Error fetching products:', error);
			return [];
		}

		return data as unknown as Product[];
	}

	function flattenProduct(
		product: Product,
		vendorIds: number[],
		showVat: boolean = false
	): FlattenedProduct {
		const tax = product.c_taxcategory?.c_tax?.[0]?.rate ?? 0;
		const purchase =
			product.productPrice.find((item) => item.m_pricelist_version_id === 5)?.pricestd ?? 0;
		const retail =
			product.productPrice.find((item) => item.m_pricelist_version_id === 13)?.pricestd ?? 0;

		const storageLookup = new Map(
			product.m_storageonhand.map((item) => [item.warehouse_id, item.qtyonhand])
		);
		const levelMinLookup = new Map(
			product.level_min.map((item) => [item.m_warehouse_id, item.level_min])
		);
		const levelMaxLookup = new Map(
			product.level_max.map((item) => [item.m_warehouse_id, item.level_max])
		);
		const productPoLookup = new Map(
			product.m_product_po.map((item) => [
				item.c_bpartner_id,
				{ pricelist: item.pricelist, vendorproductno: item.vendorproductno }
			])
		);

		const vendorPrices: { [vendorId: number]: number | null } = {};
		const vendorProductNos: { [vendorId: number]: string | null } = {};

		vendorIds.forEach((vendorId) => {
			const vendorInfo = productPoLookup.get(vendorId);
			const price = vendorInfo?.pricelist ?? null;
			vendorPrices[vendorId] =
				price === null || price === 0 ? null : showVat ? price * (1 + tax / 100) : price;
			vendorProductNos[vendorId] = vendorInfo?.vendorproductno ?? null;
		});

		const priceRetail = retail;
		const action = false; // We don't have smallestPricestd here, so we can't determine if it's an action

		const ruc = (priceRetail / (1 + tax / 100) - purchase) / purchase;

		return {
			id: product.id,
			sku: product.sku,
			name: product.name,
			barcode: product.barcode,
			mpn: product.mpn,
			unitsperpack: product.unitsperpack,
			imageurl: product.imageurl,
			discontinued: product.discontinued,
			taxRate: tax ? tax / 100 : null,
			qtyWholesale: storageLookup.get(2) ?? 0,
			qtyRetail: storageLookup.get(5) ?? 0,
			pricePurchase: showVat ? purchase * (1 + tax / 100) : purchase,
			ruc: ruc,
			priceRetail: showVat ? priceRetail : priceRetail / (1 + tax / 100),
			levelMin: levelMinLookup.get(5) ?? null, // Assuming 5 is the default warehouse ID
			levelMax: levelMaxLookup.get(5) ?? null, // Assuming 5 is the default warehouse ID
			vendorPrices,
			vendorProductNos,
			action
		};
	}

	async function exportToExcel() {
		showVendorDialog = true;
	}

	async function processExport() {
		const selectedVendorIds = vendors.filter((v) => v.selected).map((v) => v.id);

		if (selectedVendorIds.length === 0) {
			alert('Please select at least one vendor');
			return;
		}

		const productIds = cartState.items.map((item) => item.id);

		const products = await fetchProducts(productIds);
		const flattenedProducts = products.map((product) => flattenProduct(product, selectedVendorIds));

		const cartData = cartState.items.map((item) => {
			const product = flattenedProducts.find((p) => p.id === item.id);
			const baseData: { [key: string]: any } = {
				ID: item.id,
				SKU: product?.sku || '',
				MPN: product?.mpn || '',
				Name: item.name,
				Quantity: item.quantity,
				UnitsPerPack: product?.unitsperpack || 0,
				TaxRate: product?.taxRate || 0,
				QtyWholesale: product?.qtyWholesale || 0,
				QtyRetail: product?.qtyRetail || 0,
				LevelMin: product?.levelMin || 0,
				LevelMax: product?.levelMax || 0,
				PricePurchase: product?.pricePurchase || 0,
				RUC: product?.ruc || 0,
				PriceRetail: product?.priceRetail || 0
			};

			selectedVendorIds.forEach((vendorId) => {
				const vendorName = vendors.find((v) => v.id === vendorId)?.name || 'Unknown';
				baseData[`${vendorName}Price`] = product?.vendorPrices[vendorId] || null;
				baseData[`${vendorName}ProductNo`] = product?.vendorProductNos[vendorId] || '';
			});

			return baseData;
		});

		const worksheet = utils.json_to_sheet(cartData);

		// Apply Excel styles
		const range = utils.decode_range(worksheet['!ref'] || 'A1');
		for (let C = range.s.c; C <= range.e.c; ++C) {
			const address = utils.encode_col(C) + '1';
			if (!worksheet[address]) continue;
			const cell = worksheet[address];

			// Format RUC as percentage with 1 decimal
			if (cell.v === 'RUC') {
				for (let R = range.s.r + 1; R <= range.e.r; ++R) {
					const rucAddress = utils.encode_cell({ r: R, c: C });
					if (worksheet[rucAddress]) {
						worksheet[rucAddress].z = '0.0%';
					}
				}
			}

			// Format prices with 2 decimals
			if (cell.v.includes('Price')) {
				for (let R = range.s.r + 1; R <= range.e.r; ++R) {
					const priceAddress = utils.encode_cell({ r: R, c: C });
					if (worksheet[priceAddress]) {
						worksheet[priceAddress].z = '#,##0.00';
					}
				}
			}
		}

		const workbook = utils.book_new();
		utils.book_append_sheet(workbook, worksheet, 'Cart Items');

		writeFile(workbook, 'cart_items.xlsx');
		showVendorDialog = false;
		vendors = vendors.map((v) => ({ ...v, selected: false }));
	}
</script>

<div class="bg-surface-2 flex flex-col sm:w-[32rem] sm:rounded-lg sm:shadow-lg">
	<div class="flex items-center justify-between border-b p-4">
		<h2 class="text-lg font-semibold">Shopping Cart</h2>
		<div class="flex items-center gap-2">
			<button
				class="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700"
				onclick={clearCart}
			>
				Clear All
			</button>
			<button
				class="hidden items-center gap-2 rounded bg-green-600 px-4 py-2 text-sm text-white transition-colors hover:bg-green-700 sm:flex"
				onclick={exportToExcel}
			>
				<PhMicrosoftExcelLogo size={20} />
				Export to Excel
			</button>
			<button
				class="hover:bg-surface-4 bg-surface-3 items-center justify-center rounded-full p-2 text-foreground transition-colors"
				onclick={toggleCart}
			>
				<PhX size={24} />
			</button>
		</div>
	</div>
	<div class="flex-grow overflow-y-auto p-4">
		{#each cartState.items as cartItem}
			<CartItem {cartItem} />
		{/each}
	</div>
</div>

<Dialog open={showVendorDialog}>
	<DialogContent class="w-full max-w-sm sm:max-w-md">
		<DialogHeader>
			<DialogTitle>Select Vendors</DialogTitle>
			<DialogDescription>
				Choose the vendors whose prices and product numbers you want to include in the export.
			</DialogDescription>
		</DialogHeader>
		<div class="flex max-h-[40vh] flex-col space-y-2 overflow-y-auto">
			{#each vendors as vendor}
				<label class="flex items-center space-x-2">
					<Checkbox bind:checked={vendor.selected} />
					<span>{vendor.name}</span>
				</label>
			{/each}
		</div>
		<DialogFooter>
			<Button onclick={() => (showVendorDialog = false)}>Cancel</Button>
			<Button onclick={processExport}>Export</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>

<style>
	/* Add any additional styles here if needed */
</style>
