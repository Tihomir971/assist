import type { Product, ProductToUpdate } from '../types';
import { normalizeVendorProductNo, modifyPrice } from './data-processors';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isValidGTIN } from '$lib/scripts/gtin';
import type { MProductPoInsert } from '$lib/types/supabase.zod';
import type { Database } from '$lib/types/supabase';

// Configuration for import optimization
interface ImportConfig {
	batchSize: number;
	maxConcurrency: number;
	progressUpdateInterval: number;
	enableRetryOnError: boolean;
	memoryOptimization: boolean;
}

const defaultConfig: ImportConfig = {
	batchSize: 100,
	maxConcurrency: 3,
	progressUpdateInterval: 100,
	enableRetryOnError: true,
	memoryOptimization: true
};

// Utility function to chunk arrays
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < array.length; i += chunkSize) {
		chunks.push(array.slice(i, i + chunkSize));
	}
	return chunks;
}

// Debounce utility for progress updates
function debounce<T extends (...args: never[]) => void>(
	func: T,
	delay: number
): (...args: Parameters<T>) => void {
	let timeoutId: NodeJS.Timeout;
	return (...args: Parameters<T>) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => func(...args), delay);
	};
}

export async function importProducts(
	supabase: SupabaseClient<Database>,
	excelData: Product[],
	selectedSupplier: number,
	priceModificationPercentage: number,
	onProgress: (importedRows: number) => void,
	config: Partial<ImportConfig> = {}
): Promise<{
	importedRows: number;
	insertedRows: number;
	productsNotUpdated: Product[];
}> {
	// Merge with default config and optimize batch size for dataset
	const finalConfig = { ...defaultConfig, ...config };
	const dynamicBatchSize =
		finalConfig.batchSize === 100 && excelData.length > 5000
			? Math.min(150, Math.floor(excelData.length / 120)) // ~120 batches for 18k rows
			: finalConfig.batchSize;

	let importedRows = 0;
	let insertedRows = 0;
	const productsNotUpdated: Product[] = [];
	const notUpdated: Product[] = [];

	// Debounced progress updates to prevent UI blocking
	const debouncedProgress = debounce((count: number) => {
		onProgress(count);
	}, finalConfig.progressUpdateInterval);

	try {
		// OPTIMIZED: Fetch existing products and barcode data in parallel for better performance
		const [existingProductsResult, barcodeResult] = await Promise.all([
			supabase
				.from('m_product_po')
				.select('id, m_product_id, vendorproductno')
				.eq('c_bpartner_id', selectedSupplier),
			supabase.from('m_product_packing').select('gtin, m_product_id')
		]);

		if (existingProductsResult.error) throw existingProductsResult.error;

		// OPTIMIZED: Create both product map and barcode map for efficient lookups
		const productMap = new Map<
			string,
			{
				id: number;
				m_product_id: number | null;
				raw_vendorproductno: string;
			}
		>();
		const barcodeMap = new Map<string, number>();

		// Build product map for vendor product number lookups
		(existingProductsResult.data || []).forEach((p) => {
			const normalized = normalizeVendorProductNo(p.vendorproductno, selectedSupplier);
			const entry = {
				id: p.id,
				m_product_id: typeof p.m_product_id === 'number' ? p.m_product_id : null,
				raw_vendorproductno: p.vendorproductno
			};
			productMap.set(normalized, entry);
		});

		// Build barcode map for GTIN lookups
		(barcodeResult.data || []).forEach((p) => {
			if (p.gtin) {
				barcodeMap.set(p.gtin, p.m_product_id);
			}
		});

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

		// OPTIMIZED: Update products in batches with dynamic sizing
		const batches = chunkArray(productsToUpdate, dynamicBatchSize);

		for (const batch of batches) {
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
						idx,
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
						idx,
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
				debouncedProgress(importedRows); // OPTIMIZED: Non-blocking progress updates
			}
		}

		// OPTIMIZED: Process products not updated - use existing barcodeMap
		// This eliminates the need for additional barcode queries entirely!
		const productsWithMatchingBarcodes = notUpdated.filter((p: Product) =>
			barcodeMap.has(p.barcode)
		);

		// Insert products with matching barcodes
		const insertChunkSize = 100;
		for (let i = 0; i < productsWithMatchingBarcodes.length; i += insertChunkSize) {
			const insertChunk = productsWithMatchingBarcodes.slice(i, i + insertChunkSize);
			const insertData = insertChunk
				.map((product: Product) => {
					const m_product_id = barcodeMap.get(product.barcode);
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
			debouncedProgress(importedRows); // OPTIMIZED: Non-blocking progress updates
		}

		// Update productsNotUpdated to only include products that weren't inserted
		productsNotUpdated.push(
			...notUpdated.filter((product: Product) => !barcodeMap.has(product.barcode))
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
