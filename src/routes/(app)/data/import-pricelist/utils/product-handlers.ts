import type { Product, ProductToUpdate } from '../types';
import { normalizeVendorProductNo, modifyPrice } from './data-processors';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isValidGTIN } from '$lib/scripts/gtin';
import type { MProductPoInsert } from '$lib/types/supabase.zod';
import type { Database } from '$lib/types/supabase';

export async function importProducts(
	supabase: SupabaseClient<Database>,
	excelData: Product[],
	selectedSupplier: number,
	priceModificationPercentage: number,
	onProgress: (importedRows: number) => void
): Promise<{
	importedRows: number;
	insertedRows: number;
	productsNotUpdated: Product[];
}> {
	let importedRows = 0;
	let insertedRows = 0;
	const productsNotUpdated: Product[] = [];
	const notUpdated: Product[] = [];

	try {
		// Fetch existing products for this supplier
		// NOTE: include m_product_id (the FK to m_product) so RPC can target m_product_id correctly
		const { data: existingProducts, error: fetchError } = await supabase
			.from('m_product_po')
			.select('id, m_product_id, vendorproductno')
			.eq('c_bpartner_id', selectedSupplier);

		if (fetchError) throw fetchError;

		// Create a map for quick lookup, using normalized vendorproductno
		// Store both id and m_product_id so we can decide later which identifier to use for updates.
		const productMap = new Map(
			(existingProducts || []).map((p) => {
				const normalized = normalizeVendorProductNo(p.vendorproductno, selectedSupplier);
				const entry = {
					id: p.id,
					m_product_id: typeof p.m_product_id === 'number' ? p.m_product_id : null,
					raw_vendorproductno: p.vendorproductno
				};
				return [normalized, entry];
			})
		);

		// Filter Excel data to create two arrays
		const productsToUpdate: ProductToUpdate[] = [];

		excelData.forEach((product) => {
			const normalizedVendorProductNo = normalizeVendorProductNo(
				product.vendorproductno,
				selectedSupplier
			);
			const existingEntry = productMap.get(normalizedVendorProductNo);
			if (existingEntry !== undefined) {
				// existingEntry contains { id, m_product_id, raw_vendorproductno }
				productsToUpdate.push({
					...product,
					id: existingEntry.id,
					normalizedVendorProductNo,
					_existing_m_product_id: existingEntry.m_product_id, // debug helper property (transient)
					_existing_raw_vendorproductno: existingEntry.raw_vendorproductno
				} as ProductToUpdate & {
					_existing_m_product_id: number | null;
					_existing_raw_vendorproductno?: string;
				});
			} else {
				// If no matching vendorproductno is found, add to notUpdated
				notUpdated.push(product);
			}
		});

		// Update products in batches
		const batchSize = 100;
		for (let i = 0; i < productsToUpdate.length; i += batchSize) {
			const batch = productsToUpdate.slice(i, i + batchSize);

			if (batch.length === 0) {
				continue;
			}

			// Build updates and validate each item before calling the RPC
			const rawUpdates = batch.map(
				(product: ProductToUpdate & { _existing_m_product_id?: number | null }) => {
					// NOTE: the DB RPC expects where -> m_product_id and c_bpartner_id.
					// Use the existing m_product_id (not the m_product_po row id) so the function will match correctly.
					// We stored the existing m_product_id on the product as _existing_m_product_id earlier.
					const mProductId = product._existing_m_product_id;
					return {
						where: {
							m_product_id: mProductId,
							c_bpartner_id: selectedSupplier
						},
						data: {
							// send pricelist as numeric (not string) so the DB RPC can cast/aggregate correctly
							pricelist: modifyPrice(product.pricelist, priceModificationPercentage),
							vendorproductno: String(product.normalizedVendorProductNo ?? ''),
							valid_from: product.valid_from || null,
							valid_to: product.valid_to || null
						}
					};
				}
			);

			// Filter out any invalid updates (missing where keys or empty data)
			const updates = rawUpdates.filter((u, idx) => {
				// RPC expects where -> { m_product_id, c_bpartner_id }
				const whereObj = u.where as Record<string, unknown> | undefined;
				const missingWhere =
					!whereObj ||
					typeof whereObj.m_product_id !== 'number' ||
					typeof whereObj.c_bpartner_id !== 'number';
				const hasDataKeys = u.data && Object.keys(u.data).length > 0;
				if (missingWhere || !hasDataKeys) {
					console.warn(
						'[importProducts] Skipping invalid update item at batch index',
						i + idx,
						'item:',
						u
					);
					// also push the original product to productsNotUpdated for visibility
					const skippedProduct = batch[idx];
					if (skippedProduct) productsNotUpdated.push(skippedProduct);
					return false;
				}
				// Ensure data has at least one non-undefined value
				const hasNonUndefined = Object.values(u.data).some((v) => v !== undefined);
				if (!hasNonUndefined) {
					console.warn(
						'[importProducts] Skipping update with only undefined data at batch index',
						i + idx,
						'item:',
						u
					);
					const skippedProduct = batch[idx];
					if (skippedProduct) productsNotUpdated.push(skippedProduct);
					return false;
				}
				return true;
			});

			if (updates.length === 0) {
				console.info('[importProducts] No valid updates in this batch, skipping RPC call.');
				continue;
			}

			const { error } = await supabase.rpc('bulk_update_product_po', { updates });

			if (error) {
				console.error('Error updating product batch via RPC:', error);
				// On RPC error, push these products to notUpdated for later processing
				productsNotUpdated.push(...batch);
				continue;
			}

			for (let j = 0; j < updates.length; j++) {
				importedRows++;
				onProgress(importedRows);
			}
		}

		// Process products not updated
		const barcodes = notUpdated.map((p: Product) => p.barcode);
		const matchingProducts = [];
		const chunkSize = 100;

		for (let i = 0; i < barcodes.length; i += chunkSize) {
			const barcodeChunk = barcodes.slice(i, i + chunkSize);

			const { data: chunkMatchingProducts, error: barcodeError } = await supabase
				.from('m_product_packing')
				.select('gtin, m_product_id')
				.in('gtin', barcodeChunk);

			if (barcodeError) {
				throw barcodeError;
			}

			matchingProducts.push(...chunkMatchingProducts);
		}

		const barcodeMatches = new Map(matchingProducts.map((p) => [p.gtin, p.m_product_id]));
		const productsWithMatchingBarcodes = notUpdated.filter((p: Product) =>
			barcodeMatches.has(p.barcode)
		);

		// Insert products with matching barcodes
		const insertChunkSize = 100;
		for (let i = 0; i < productsWithMatchingBarcodes.length; i += insertChunkSize) {
			const insertChunk = productsWithMatchingBarcodes.slice(i, i + insertChunkSize);
			const insertData = insertChunk
				.map((product: Product) => {
					const m_product_id = barcodeMatches.get(product.barcode);
					if (typeof m_product_id !== 'number') {
						return null; // Skip this product if m_product_id is not a number
					}
					const vendorproductno = normalizeVendorProductNo(
						product.vendorproductno,
						selectedSupplier
					);
					return {
						m_product_id: m_product_id,
						c_bpartner_id: selectedSupplier,
						vendorproductno: vendorproductno,
						manufacturer: product.manufacturer,
						vendorcategory: product.vendorcategory,
						pricelist: modifyPrice(product.pricelist, priceModificationPercentage),
						valid_from: product.valid_from || null,
						valid_to: product.valid_to || null
					};
				})
				.filter(Boolean) as MProductPoInsert[];

			const { data, error } = await supabase.from('m_product_po').insert(insertData).select();

			if (error) {
				console.error('Error inserting products:', error);
				continue;
			}

			insertedRows += data.length;
			importedRows += data.length;
			onProgress(importedRows);
		}

		// Update productsNotUpdated to only include products that weren't inserted
		productsNotUpdated.push(
			...notUpdated.filter((product: Product) => !barcodeMatches.has(product.barcode))
		);

		return { importedRows, insertedRows, productsNotUpdated };
	} catch (error) {
		console.error('Error importing products:', error);
		throw error;
	}
}

export async function addProduct(
	supabase: SupabaseClient<Database>,
	product: Product,
	selectedSupplier: number,
	priceModificationPercentage: number
): Promise<void> {
	if (!isValidGTIN(product.barcode)) {
		throw new Error('Invalid GTIN. Please check the barcode.');
	}

	// Insert into m_product
	const { data: productData, error: productError } = await supabase
		.from('m_product')
		.insert({ name: product.name, c_taxcategory_id: 1 })
		.select('id')
		.single();

	if (productError) throw productError;

	const productId = productData.id;

	// Insert into m_product_po
	const { error: poError } = await supabase.from('m_product_po').insert({
		m_product_id: productId,
		c_bpartner_id: selectedSupplier,
		vendorproductno: normalizeVendorProductNo(product.vendorproductno, selectedSupplier),
		pricelist: modifyPrice(product.pricelist, priceModificationPercentage),
		valid_from: product.valid_from || null,
		valid_to: product.valid_to || null
	});

	if (poError) throw poError;

	const { error: gtinError } = await supabase.from('m_product_packing').insert({
		m_product_id: productId,
		packing_type: 'Individual',
		gtin: product.barcode
	});

	if (gtinError) throw gtinError;
}
