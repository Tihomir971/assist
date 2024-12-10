<script lang="ts">
	import { utils, writeFile } from 'xlsx';
	import PhMicrosoftExcelLogo from 'phosphor-svelte/lib/MicrosoftExcelLogo';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Minus from 'phosphor-svelte/lib/Minus';
	import Plus from 'phosphor-svelte/lib/Plus';
	import Trash from 'phosphor-svelte/lib/Trash';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import type { FlattenedProduct, Product, ExportData } from './types';
	import type { Database } from '$lib/types/supabase';
	import { getCartContext } from './ctx.svelte';

	interface Props {
		supabase: SupabaseClient<Database>;
	}

	let { supabase }: Props = $props();
	const cartStorageCtx = getCartContext();

	let showVendorDialog = $state(false);
	let isInternalTransfer = $state(false);

	let vendors = $state([
		{ id: 480, name: 'Agrofina', selected: false },
		{ id: 4, name: 'Mercator', selected: false },
		{ id: 89, name: 'Mivex', selected: false },
		{ id: 2, name: 'Cenoteka', selected: false },
		{ id: 714, name: 'Harizma', selected: false }
	]);

	function clearCart() {
		cartStorageCtx.current = [];
	}

	async function fetchProducts(productIds: (string | number)[]): Promise<Product[]> {
		const { data, error } = await supabase
			.from('m_product')
			.select(
				`
				id, sku, name, barcode, mpn, unitsperpack, imageurl, discontinued,
				c_taxcategory(c_tax(rate)),
				m_storageonhand(warehouse_id,qtyonhand),
				m_productprice(m_pricelist_version_id,pricestd,pricelist),
				m_replenish(m_warehouse_id,level_min,level_max,qtybatchsize),
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
			product.m_productprice.find((item) => item.m_pricelist_version_id === 5)?.pricestd ?? 0;
		const retail =
			product.m_productprice.find((item) => item.m_pricelist_version_id === 13)?.pricestd ?? 0;

		const storageLookup = new Map(
			product.m_storageonhand.map((item) => [item.warehouse_id, item.qtyonhand])
		);
		const replenishLookup = new Map(
			product.m_replenish.map((item) => [
				item.m_warehouse_id,
				{
					level_min: item.level_min,
					level_max: item.level_max,
					qtybatchsize: item.qtybatchsize
				}
			])
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
		const action = false;

		const ruc = purchase ? (priceRetail / (1 + tax / 100) - purchase) / purchase : 0;

		const replenishInfo = replenishLookup.get(5) ?? {
			level_min: null,
			level_max: null,
			qtybatchsize: null
		};

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
			levelMin: replenishInfo.level_min,
			levelMax: replenishInfo.level_max,
			qtyBatchSize: replenishInfo.qtybatchsize,
			vendorPrices,
			vendorProductNos,
			action
		};
	}

	async function processExport() {
		try {
			const selectedVendorIds = vendors.filter((v) => v.selected).map((v) => v.id);
			const productIds = cartStorageCtx.current.map((item) => item.id);

			const products = await fetchProducts(productIds);
			const flattenedProducts = products.map((product) =>
				flattenProduct(product, selectedVendorIds)
			);

			const cartData: ExportData[] = cartStorageCtx.current
				.map((item) => {
					const product = flattenedProducts.find((p) => p.id === item.id);
					if (!product) {
						return null; // Skip if product doesn't exist
					}

					const data: ExportData = {
						id: item.id,
						sku: product.sku || '',
						mpn: product.mpn || '',
						name: item.name,
						quantity: item.quantity,
						unitsperpack: product.unitsperpack || 0,
						taxRate: product.taxRate || 0,
						qtyWholesale: product.qtyWholesale || 0,
						qtyRetail: product.qtyRetail || 0,
						levelMin: product.levelMin || 0,
						levelMax: product.levelMax || 0,
						qtyBatchSize: product.qtyBatchSize || 0,
						pricePurchase: product.pricePurchase || 0,
						ruc: product.ruc || 0,
						priceRetail: product.priceRetail || 0
					};

					if (isInternalTransfer) {
						const levelMax = product.levelMax || 0;
						const qtyRetail = product.qtyRetail || 0;
						const qtyBatchSize = product.qtyBatchSize || 0;
						const qtyWholesale = product.qtyWholesale || 0;

						if (qtyBatchSize > 0) {
							// Calculate initial transfer quantity based on levelMax - qtyRetail
							const initialTransfer =
								Math.floor((levelMax - qtyRetail) / qtyBatchSize) * qtyBatchSize;
							// Limit transfer quantity to not exceed qtyWholesale while maintaining qtyBatchSize units
							data.qtyTransfer =
								Math.floor(Math.min(initialTransfer, qtyWholesale) / qtyBatchSize) * qtyBatchSize;
						}
					}

					selectedVendorIds.forEach((vendorId) => {
						const vendorName = vendors.find((v) => v.id === vendorId)?.name || 'Unknown';
						data[`${vendorName}Price`] = product.vendorPrices[vendorId] || null;
						data[`${vendorName}ProductNo`] = product.vendorProductNos[vendorId] || '';
					});

					return data;
				})
				.filter((item): item is ExportData => item !== null); // Type guard to remove null items

			const worksheet = utils.json_to_sheet(cartData);

			// Get the range of the worksheet
			const range = utils.decode_range(worksheet['!ref'] || 'A1');

			// Find indices of price columns and check if any have non-null values
			const priceColumns: number[] = [];
			let hasNonNullPrices = false;
			for (let C = range.s.c; C <= range.e.c; ++C) {
				const address = utils.encode_col(C) + '1';
				if (!worksheet[address]) continue;
				const cell = worksheet[address];
				if (
					cell.v.toString().includes('Price') &&
					!cell.v.toString().includes('pricePurchase') &&
					!cell.v.toString().includes('priceRetail')
				) {
					priceColumns.push(C);
					// Check if this price column has any non-null values
					for (let R = range.s.r + 1; R <= range.e.r; ++R) {
						const priceCell = worksheet[utils.encode_cell({ r: R, c: C })];
						if (priceCell && priceCell.v !== null && priceCell.v !== '') {
							hasNonNullPrices = true;
							break;
						}
					}
				}
			}

			let finalRange = range;
			let lastColumn = range.e.c;

			// Only add MIN formula column if there are selected vendors with prices
			if (selectedVendorIds.length > 0 && hasNonNullPrices) {
				const minPriceCol = lastColumn + 1;
				const minPriceColLetter = utils.encode_col(minPriceCol);
				worksheet[`${minPriceColLetter}1`] = { v: 'MinVendorPrice', t: 's' };

				// Add MIN formula for each row
				for (let R = range.s.r + 1; R <= range.e.r; ++R) {
					const priceRefs = priceColumns.map((col) => `${utils.encode_col(col)}${R + 1}`).join(',');
					worksheet[`${minPriceColLetter}${R + 1}`] = {
						f: `MIN(${priceRefs})`,
						t: 'n',
						z: '#,##0.00'
					};
				}

				lastColumn = minPriceCol;
			}

			// Add New Price column if internal transfer is enabled
			if (isInternalTransfer) {
				const newPriceCol = lastColumn + 1;
				const newPriceColLetter = utils.encode_col(newPriceCol);
				const purchaseColLetter = utils.encode_col(range.s.c + 12); // pricePurchase column (index 12)
				const taxColLetter = utils.encode_col(range.s.c + 6); // taxRate column (index 6)

				worksheet[`${newPriceColLetter}1`] = { v: 'New Price', t: 's' };

				// Add formula for each row
				for (let R = range.s.r + 1; R <= range.e.r; ++R) {
					const rowNum = R + 1;
					worksheet[`${newPriceColLetter}${rowNum}`] = {
						f: `ROUNDUP(IF(${purchaseColLetter}${rowNum}<=20,${purchaseColLetter}${rowNum}*1.5*(1+${taxColLetter}${rowNum}),IF(${purchaseColLetter}${rowNum}>=100,${purchaseColLetter}${rowNum}*1.25*(1+${taxColLetter}${rowNum}),${purchaseColLetter}${rowNum}*(1.25+(${purchaseColLetter}${rowNum}-100)/(20-100)*(1.5-1.25))*(1+${taxColLetter}${rowNum}))),0)-0.01`,
						t: 'n',
						z: '#,##0.00'
					};
				}

				lastColumn = newPriceCol;
			}

			// Update worksheet range to include all columns
			finalRange = {
				s: { c: range.s.c, r: range.s.r },
				e: { c: lastColumn, r: range.e.r }
			};

			// Update worksheet range
			worksheet['!ref'] = utils.encode_range(finalRange);

			// Apply number formatting
			for (let C = finalRange.s.c; C <= finalRange.e.c; ++C) {
				const address = utils.encode_col(C) + '1';
				if (!worksheet[address]) continue;
				const cell = worksheet[address];

				if (cell.v === 'ruc') {
					for (let R = finalRange.s.r + 1; R <= finalRange.e.r; ++R) {
						const rucAddress = utils.encode_cell({ r: R, c: C });
						if (worksheet[rucAddress]) {
							worksheet[rucAddress].z = '0.0%';
						}
					}
				}

				if (cell.v.toString().includes('price') || cell.v.toString().includes('Price')) {
					for (let R = finalRange.s.r + 1; R <= finalRange.e.r; ++R) {
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
			isInternalTransfer = false;
		} catch (error) {
			console.error('Error in processExport:', error);
		}
	}
</script>

<div class="flex h-full flex-col">
	<div class="mb-2 flex items-center gap-2">
		<Button variant="destructive" onclick={clearCart}>Clear All</Button>
		<Button onclick={() => (showVendorDialog = true)}>
			<PhMicrosoftExcelLogo size={20} />
			Export to Excel
		</Button>
	</div>
	<div class="h-full overflow-y-auto pr-2">
		{#each cartStorageCtx.current as cartItem}
			<div
				class="bg-surface-3 mb-2 flex flex-col items-start justify-between rounded-md p-3 sm:flex-row sm:items-center"
			>
				<div class="mb-2 flex flex-col sm:mb-0">
					<span class="text-sm font-medium">{cartItem.name}</span>
					<span class="text-xs text-gray-500">SKU: {cartItem.sku}</span>
				</div>
				<div class="flex items-center space-x-2">
					<Button
						size="icon"
						variant="ghost"
						onclick={() => {
							const index = cartStorageCtx.current.findIndex((item) => item.id === cartItem.id);
							if (index !== -1 && cartItem.quantity > 1) {
								cartStorageCtx.current = [
									...cartStorageCtx.current.slice(0, index),
									{
										...cartStorageCtx.current[index],
										quantity: cartStorageCtx.current[index].quantity - 1
									},
									...cartStorageCtx.current.slice(index + 1)
								];
							}
						}}
					>
						<Minus size={14} />
					</Button>
					<span class="w-8 text-center text-sm font-medium">{cartItem.quantity}</span>
					<Button
						size="icon"
						variant="ghost"
						onclick={() => {
							const index = cartStorageCtx.current.findIndex((item) => item.id === cartItem.id);
							if (index !== -1) {
								cartStorageCtx.current = [
									...cartStorageCtx.current.slice(0, index),
									{
										...cartStorageCtx.current[index],
										quantity: cartStorageCtx.current[index].quantity + 1
									},
									...cartStorageCtx.current.slice(index + 1)
								];
							}
						}}
					>
						<Plus size={14} />
					</Button>
					<Button
						size="icon"
						variant="destructive"
						onclick={() => {
							const index = cartStorageCtx.current.findIndex((item) => item.id === cartItem.id);
							if (index !== -1) {
								cartStorageCtx.current = [
									...cartStorageCtx.current.slice(0, index),
									...cartStorageCtx.current.slice(index + 1)
								];
							}
						}}
					>
						<Trash size={14} />
					</Button>
				</div>
			</div>
		{/each}
	</div>

	<Dialog.Root open={showVendorDialog}>
		<Dialog.Content class="w-full max-w-sm sm:max-w-md">
			<Dialog.Header>
				<Dialog.Title>Select Vendors</Dialog.Title>
				<Dialog.Description>
					Choose the vendors whose prices and product numbers you want to include in the export.
				</Dialog.Description>
			</Dialog.Header>
			<div class="flex max-h-[40vh] flex-col space-y-4">
				<div class="flex flex-col space-y-2 overflow-y-auto">
					{#each vendors as vendor}
						<label class="flex items-center space-x-2">
							<Checkbox bind:checked={vendor.selected} />
							<span>{vendor.name}</span>
						</label>
					{/each}
				</div>
				<label class="flex items-center space-x-2">
					<Checkbox bind:checked={isInternalTransfer} />
					<span>Internal transfer</span>
				</label>
			</div>
			<Dialog.Footer>
				<Button onclick={() => (showVendorDialog = false)}>Cancel</Button>
				<Button onclick={processExport}>Export</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
</div>
