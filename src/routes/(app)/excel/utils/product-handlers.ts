import type { Product, ProductToUpdate } from '../types';
import { normalizeVendorProductNo, modifyPrice } from './data-processors';
import type { SupabaseClient } from '@supabase/supabase-js';
import { isValidGTIN } from '$lib/scripts/gtin';

export async function importProducts(
	supabase: SupabaseClient,
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
		const { data: existingProducts, error: fetchError } = await supabase
			.from('m_product_po')
			.select('id, vendorproductno')
			.eq('c_bpartner_id', selectedSupplier);

		if (fetchError) throw fetchError;

		// Create a map for quick lookup, using normalized vendorproductno
		const productMap = new Map(
			existingProducts.map((p) => [
				normalizeVendorProductNo(p.vendorproductno, selectedSupplier),
				p.id
			])
		);

		// Filter Excel data to create two arrays
		const productsToUpdate: ProductToUpdate[] = [];

		excelData.forEach((product) => {
			const normalizedVendorProductNo = normalizeVendorProductNo(
				product.vendorproductno,
				selectedSupplier
			);
			const existingProductId = productMap.get(normalizedVendorProductNo);
			if (existingProductId !== undefined) {
				productsToUpdate.push({
					...product,
					id: existingProductId,
					normalizedVendorProductNo
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

			for (const product of batch) {
				const { error } = await supabase
					.from('m_product_po')
					.update({
						pricelist: modifyPrice(product.pricelist, priceModificationPercentage),
						vendorproductno: product.normalizedVendorProductNo,
						valid_from: product.valid_from || null,
						valid_to: product.valid_to || null
					})
					.eq('id', product.id)
					.eq('c_bpartner_id', selectedSupplier);

				if (error) {
					console.error('Error updating product:', error);
					continue;
				}

				importedRows++;
				onProgress(importedRows);
			}
		}

		// Process products not updated
		const barcodes = notUpdated.map((p: Product) => p.barcode);
		const matchingProducts = [];
		const chunkSize = 10;

		for (let i = 0; i < barcodes.length; i += chunkSize) {
			const barcodeChunk = barcodes.slice(i, i + chunkSize);

			const { data: chunkMatchingProducts, error: barcodeError } = await supabase
				.from('m_product_packaging')
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

			const insertData = insertChunk.map((product: Product) => ({
				m_product_id: barcodeMatches.get(product.barcode),
				c_bpartner_id: selectedSupplier,
				vendorproductno: normalizeVendorProductNo(product.vendorproductno, selectedSupplier),
				manufacturer: product.manufacturer,
				vendorcategory: product.vendorcategory,
				pricelist: modifyPrice(product.pricelist, priceModificationPercentage),
				valid_from: product.valid_from || null,
				valid_to: product.valid_to || null
			}));

			const { data, error } = await supabase.from('m_product_po').insert(insertData).select();

			if (error) {
				console.error('Error inserting products:', error);
				continue;
			}

			insertedRows += data.length;
			importedRows += data.length;
			onProgress(importedRows);

			// Add a small delay to allow UI updates
			await new Promise((resolve) => setTimeout(resolve, 10));
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
	supabase: SupabaseClient,
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

	// Insert into m_product_gtin
	const { error: gtinError } = await supabase.from('m_product_packing').insert({
		m_product_id: productId,
		gtin: product.barcode
	});

	if (gtinError) throw gtinError;
}
