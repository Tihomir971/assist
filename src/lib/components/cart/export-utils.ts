import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from '$lib/types/supabase.types';
import type { ExportData, SalesActionData } from './types';
import { utils, writeFile } from 'xlsx';
// import FormulaJSWrapper from '$lib/scripts/excel_formula_evaluator';
import { PriceCalculator } from '$lib/price-calculator';
// const evaluator = new FormulaJSWrapper();

interface PriceCalculationParams {
	lowerBound: number;
	upperBound: number;
	lowerPercent: number;
	upperPercent: number;
}

type FetchedProduct = Awaited<ReturnType<typeof fetchProducts>>[number];

async function fetchProducts(supabase: SupabaseClient<Database>, productIds: number[]) {
	const { data, error } = await supabase
		.from('m_product')
		.select(
			`
            id, sku, name, mpn, imageurl, discontinued,
            c_taxcategory(c_tax(rate)),
            m_storageonhand(warehouse_id,qtyonhand),
            m_productprice(m_pricelist_version_id,pricestd,pricelist),
            m_replenish(m_warehouse_id,level_min,level_max,qtybatchsize),
            m_product_po(c_bpartner_id,pricelist,vendorproductno),
            m_product_packing(gtin,unitsperpack,packing_type)
        `
		)
		.eq('m_product_packing.packing_type', 'Pack')
		.in('id', productIds);

	if (error) {
		console.error('Error fetching products:', error);
		return [];
	}

	return data;
}

function flattenProduct(product: FetchedProduct, vendorIds: number[], vat: boolean = false) {
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
			price === null || price === 0 ? null : vat ? price * (1 + tax / 100) : price;
		vendorProductNos[vendorId] = vendorInfo?.vendorproductno ?? null;
	});

	const priceRetail = retail;
	const action = false;

	const ruc = purchase ? (priceRetail / (1 + tax / 100) - purchase) / purchase : 0;

	const replenishInfoWarehouse5 = replenishLookup.get(5) ?? {
		level_min: null,
		level_max: null,
		qtybatchsize: null
	};

	const replenishInfoWarehouse2 = replenishLookup.get(2) ?? {
		level_min: null,
		level_max: null,
		qtybatchsize: null
	};

	return {
		id: product.id,
		sku: product.sku,
		name: product.name,
		mpn: product.mpn,
		unitsperpack: product.m_product_packing?.[0]?.unitsperpack ?? 1,
		imageurl: product.imageurl,
		discontinued: product.discontinued,
		taxPercent: tax ? tax / 100 : 0,
		qtyWholesale: storageLookup.get(2) ?? 0,
		qtyRetail: storageLookup.get(5) ?? 0,
		pricePurchase: vat ? purchase * (1 + tax / 100) : purchase,
		ruc: ruc,
		priceRetail: vat ? priceRetail : priceRetail / (1 + tax / 100),
		levelMin: replenishInfoWarehouse5.level_min ?? 0,
		levelMax: replenishInfoWarehouse5.level_max ?? 0,
		qtyBatchSize: replenishInfoWarehouse5.qtybatchsize ?? 0,
		levelMinWarehouse2: replenishInfoWarehouse2.level_min ?? 0,
		levelMaxWarehouse2: replenishInfoWarehouse2.level_max ?? 0,
		qtyBatchSizeWarehouse2: replenishInfoWarehouse2.qtybatchsize ?? 0,
		vendorPrices,
		vendorProductNos,
		action
	};
}

export async function processExport(
	cartItems: { id: number; name: string; quantity: number; sku: string | null }[],
	vendors: { id: number; name: string; selected: boolean }[],
	selectReportValue: string | undefined,
	supabase: SupabaseClient<Database>
) {
	try {
		const selectedVendorIds = vendors.filter((v) => v.selected).map((v) => v.id);
		const productIds = cartItems.map((item) => item.id);

		const products = await fetchProducts(supabase, productIds);

		// Fetch price formula variables for all products
		const productVariablesMap = new Map<number, PriceCalculationParams | null>();
		if (products.length > 0) {
			const rpcCalls = products.map(async (p) => {
				const { data, error } = await supabase.rpc('get_price_formula_variables', {
					p_m_product_id: p.id
				});
				return { productId: p.id, variables: data as Json | null, error };
			});
			const resolvedVariablesResults = await Promise.all(rpcCalls);
			console.log('resolvedVariablesResults', resolvedVariablesResults);

			resolvedVariablesResults.forEach((res) => {
				if (res.error) {
					console.error(
						`Error fetching price formula variables for product ${res.productId}:`,
						res.error
					);
					productVariablesMap.set(res.productId, null);
				} else {
					const vars = res.variables;
					// Basic validation for the structure of variables
					if (vars && typeof vars === 'object' && vars !== null && !Array.isArray(vars)) {
						// At this point, vars is a non-null, non-array object.
						// We can cast to Record<string, unknown> to safely access potential properties.
						const potentialParams = vars as Record<string, unknown>;
						if (
							typeof potentialParams.lowerBound === 'number' &&
							typeof potentialParams.upperBound === 'number' &&
							typeof potentialParams.lowerPercent === 'number' &&
							typeof potentialParams.upperPercent === 'number'
						) {
							productVariablesMap.set(res.productId, {
								lowerBound: potentialParams.lowerBound,
								upperBound: potentialParams.upperBound,
								lowerPercent: potentialParams.lowerPercent,
								upperPercent: potentialParams.upperPercent
							} as PriceCalculationParams);
						} else {
							// Object structure doesn't match PriceCalculationParams
							console.warn(
								`Price formula variables for product ${res.productId} have missing or mistyped properties:`,
								vars
							);
							productVariablesMap.set(res.productId, null);
						}
					} else {
						// vars is null, not an object, or is an array
						if (vars !== null) {
							// Log if data is present but not a suitable object structure
							console.warn(
								`Price formula variables for product ${res.productId} have unexpected type (expected object, got ${typeof vars}):`,
								vars
							);
						}
						productVariablesMap.set(res.productId, null);
					}
				}
			});
		}

		const flattenedProducts = products.map((product) => {
			const flatProduct = flattenProduct(product, selectedVendorIds);
			return {
				...flatProduct,
				priceFormulaVariables: productVariablesMap.get(product.id) || null
			};
		});

		// Create data structure based on report type
		const cartData = cartItems
			.map((item) => {
				const product = flattenedProducts.find((p) => p.id === item.id) as
					| (ReturnType<typeof flattenProduct> & {
							priceFormulaVariables: PriceCalculationParams | null;
					  })
					| undefined;
				if (!product) return null;

				if (selectReportValue === 'sales_action') {
					// Collect vendor prices first
					const vendorPrices: number[] = [];
					selectedVendorIds.forEach((vendorId) => {
						const vendorPrice = product.vendorPrices[vendorId] || null;
						if (vendorPrice !== null) {
							vendorPrices.push(vendorPrice);
						}
					});

					// Calculate max price and final prices
					const maxPrice = Math.max(product.pricePurchase || 0, ...vendorPrices);
					const cenaSaPdv = Math.ceil(maxPrice * (1 + (product.taxPercent || 0))) - 0.01;

					// Create base data without final prices
					const salesActionData: SalesActionData = {
						Artikal: product.sku || '',
						name: item.name,
						pricePurchase: product.pricePurchase || 0,
						priceRetail: product.priceRetail || 0
					};

					// Add vendor columns
					selectedVendorIds.forEach((vendorId) => {
						const vendorName = vendors.find((v) => v.id === vendorId)?.name || 'Unknown';
						salesActionData[`${vendorName}Price`] = product.vendorPrices[vendorId] || null;
						salesActionData[`${vendorName}PN`] = product.vendorProductNos[vendorId] || '';
					});

					// Add final prices as last columns
					salesActionData['Cena bez PDV'] = maxPrice;
					salesActionData['Cena sa PDV'] = cenaSaPdv;

					return salesActionData;
				} else if (selectReportValue === 'internal_transfer') {
					const levelMax = product.levelMax || 0;
					const qtyRetail = product.qtyRetail || 0;
					const qtyBatchSize = product.qtyBatchSize || 0;
					const qtyWholesale = product.qtyWholesale || 0;

					let kolicina = 0;
					if (qtyBatchSize > 0 && levelMax - qtyRetail >= qtyBatchSize) {
						const numberOfBatches = Math.floor((levelMax - qtyRetail) / qtyBatchSize);
						kolicina = Math.min(numberOfBatches * qtyBatchSize, qtyWholesale);
					}
					const calculator = new PriceCalculator();

					const defaultCalcParams: PriceCalculationParams = {
						lowerBound: 0,
						upperBound: 100,
						lowerPercent: 0.2,
						upperPercent: 0.3
					};

					const formulaVars = product.priceFormulaVariables;
					// More robust check for a valid parameters object
					const calcParams =
						formulaVars &&
						typeof formulaVars === 'object' &&
						Object.keys(formulaVars).length > 0 && // Ensure it's not an empty object
						typeof formulaVars.lowerBound === 'number' &&
						typeof formulaVars.upperBound === 'number' &&
						typeof formulaVars.lowerPercent === 'number' &&
						typeof formulaVars.upperPercent === 'number'
							? formulaVars
							: defaultCalcParams;

					return {
						Šifra: product.sku || '',
						name: item.name,
						unitsperpack: product.unitsperpack || 0,
						qtyWholesale: product.qtyWholesale || 0,
						qtyRetail: product.qtyRetail || 0,
						levelMin: product.levelMin || 0,
						levelMax: product.levelMax || 0,
						qtyBatchSize: product.qtyBatchSize || 0,
						'Pack Qty.': Number((kolicina / product.unitsperpack || 0).toFixed(2)),
						Količina: kolicina,
						'Cena u obj.2': calculator.customCalculate(
							product.pricePurchase,
							product.taxPercent,
							calcParams
						)
						// 'Cena u obj.2': calculateNewPrice(product.pricePurchase || 0, product.taxRate || 0)
						/* 'Cena u obj.2': calculator.calculate(
							'input_price <= 0? input_price * 1.3 : input_price >= 100 ? input_price * 1.2 : input_price * (1.2 + (input_price - 100) / (0 - 100) * 0.1)',
							product.taxPercent,
							product.pricePurchase
						)*/
						// 'Cena u  obj.2': calculateNewPrice(product.pricePurchase || 0, product.taxRate || 0)
					};
				} else if (selectReportValue === 'vendor_orders') {
					// Default export
					const vpMaxVal = product.levelMaxWarehouse2 || 0;
					const mpMaxVal = product.levelMax || 0;
					const mpQtyVal = product.qtyRetail || 0;
					const mpBatchVal = product.qtyBatchSize || 0;
					const vpQtyVal = product.qtyWholesale || 0;
					const vpBatchVal = product.qtyBatchSizeWarehouse2 || 0;

					let orderQty: number;

					if (vpMaxVal === 0) {
						if (mpBatchVal > 0 && mpMaxVal > mpQtyVal) {
							orderQty = Math.floor((mpMaxVal - mpQtyVal) / mpBatchVal) * mpBatchVal;
						} else {
							orderQty = 0;
						}
					} else {
						if (vpBatchVal > 0 && vpMaxVal > vpQtyVal) {
							orderQty = Math.floor((vpMaxVal - vpQtyVal) / vpBatchVal) * vpBatchVal;
						} else {
							orderQty = 0;
						}
					}

					const data: ExportData = {
						SKU: product.sku || '',
						MPN: product.mpn || '',
						Name: item.name,
						'Order Qty.': orderQty, // Use the calculated value
						'Pack Qty.': product.unitsperpack || 0,
						Tax: product.taxPercent || 0,
						'VP Qty.': vpQtyVal,
						'MP Qty.': mpQtyVal,
						'VP Max': vpMaxVal,
						'VP Batch': vpBatchVal,
						'MP Max': mpMaxVal,
						'MP Batch': mpBatchVal,
						pricePurchase: product.pricePurchase || 0,
						priceRetail: product.priceRetail || 0
					};

					selectedVendorIds.forEach((vendorId) => {
						const vendorName = vendors.find((v) => v.id === vendorId)?.name || 'Unknown';
						data[`${vendorName}Price`] = product.vendorPrices[vendorId] || null;
						data[`${vendorName}PN`] = product.vendorProductNos[vendorId] || '';
					});

					return data;
				}
			})
			.filter((item) => item !== null);

		const worksheet = utils.json_to_sheet(cartData);

		// Get the range of the worksheet for further processing
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

			if (
				cell.v.toString().includes('levelMinWarehouse2') ||
				cell.v.toString().includes('levelMaxWarehouse2') ||
				cell.v.toString().includes('qtyBatchSizeWarehouse2')
			) {
				for (let R = finalRange.s.r + 1; R <= finalRange.e.r; ++R) {
					const address = utils.encode_cell({ r: R, c: C });
					if (worksheet[address]) {
						worksheet[address].z = '#,##0.00';
					}
				}
			}
		}

		const workbook = utils.book_new();
		utils.book_append_sheet(workbook, worksheet, 'Cart Items');

		writeFile(
			workbook,
			selectReportValue === 'internal_transfer'
				? 'Interni račun robe.xlsx'
				: selectReportValue === 'sales_action'
					? 'Definisanje prodajnih akcija.xlsx'
					: selectReportValue === 'vendor_orders'
						? 'Narudžbine dobavljačima.xlsx'
						: 'cart_items.xlsx'
		);

		return true;
	} catch (error) {
		console.error('Error in processExport:', error);
		return false;
	}
}
