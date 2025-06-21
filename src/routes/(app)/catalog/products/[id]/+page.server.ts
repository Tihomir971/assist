import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { createSimpleCRUD } from '$lib/utils/simple-crud.factory';
import {
	ProductService,
	CategoryService,
	PartnerService,
	WarehouseService,
	AttributeSetService,
	ProductPackingService,
	ProductPoService,
	ReplenishService,
	BrandService // Added BrandService
} from '$lib/services/supabase';
import { TaxCategoryService, StorageOnHandService } from '$lib/services/supabase/';
import {
	mProductInsertSchema,
	mProductPackingInsertSchema,
	mProductPoInsertSchema,
	mReplenishInsertSchema
} from '$lib/types/supabase.zod.schemas';
import { productPayloadBuilder } from './product.payload';
import { productPackingPayloadBuilder } from './product-packing.payload';
import { productPoPayloadBuilder } from './product-po.payload';
import { replenishPayloadBuilder } from './replenish.payload';
import { connector } from '$lib/ky';
import type { ChartData } from '../../../../../lib/components/charts/chart-types';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ depends, params, locals: { supabase } }) => {
	depends('catalog:products');

	const productId = parseInt(params.id);
	if (isNaN(productId)) {
		throw error(400, 'Invalid product ID');
	}

	const productService = new ProductService(supabase);
	const product = await productService.getById(productId);

	if (!product) {
		throw error(404, 'Product not found');
	}

	const getSalesData = async (sku: string | null) => {
		if (!sku) return { currentYear: new Date().getFullYear(), products: [] };
		try {
			const data = await connector
				.post('api/sales', { json: { productIds: [sku], yearCount: 3 } })
				.json<ChartData>();
			return data;
		} catch (e) {
			console.error('Failed to fetch sales data', e);
			return { currentYear: new Date().getFullYear(), products: [] };
		}
	};

	const [
		uom,
		categories,
		partners,
		replenishes,
		warehouses,
		purchases,
		productPacking,
		tax,
		salesByWeeks,
		storageonhand,
		attributeSets,
		brands // Added brands
	] = await Promise.all([
		productService.getUoms(),
		new CategoryService(supabase).getLookup(),
		new PartnerService(supabase).getLookup({ isvendor: true }),
		new ReplenishService(supabase).list({ m_product_id: productId }),
		new WarehouseService(supabase).getLookup(),
		new ProductPoService(supabase).list({ m_product_id: productId }),
		new ProductPackingService(supabase).list({ m_product_id: productId }),
		new TaxCategoryService(supabase).getLookup(),
		getSalesData(product.sku),
		new StorageOnHandService(supabase).list({ m_product_id: productId }),
		new AttributeSetService(supabase).getLookup(),
		new BrandService(supabase).getLookup() // Fetch product brands
	]);

	const [formProduct, formProductPacking, formReplenish, formProductPo] = await Promise.all([
		superValidate(product, zod(mProductInsertSchema)),
		superValidate(zod(mProductPackingInsertSchema)),
		superValidate(zod(mReplenishInsertSchema)),
		superValidate(zod(mProductPoInsertSchema))
	]);

	return {
		entity: product,
		formProduct,
		purchases,
		formProductPo,
		productPacking,
		formProductPacking,
		replenishes,
		formReplenish,
		storageonhand,
		lookupData: {
			partners,
			uom,
			categories,
			warehouses,
			tax,
			attributeSets,
			brands // Added brands to lookupData
		},
		salesByWeeks
	};
};

const productCRUD = createSimpleCRUD(
	'Product',
	(supabase) => new ProductService(supabase),
	productPayloadBuilder,
	mProductInsertSchema
);

const productPackingCRUD = createSimpleCRUD(
	'ProductPacking',
	(supabase) => new ProductPackingService(supabase),
	productPackingPayloadBuilder,
	mProductPackingInsertSchema
);

const productPoCRUD = createSimpleCRUD(
	'ProductPo',
	(supabase) => new ProductPoService(supabase),
	productPoPayloadBuilder,
	mProductPoInsertSchema
);

const replenishCRUD = createSimpleCRUD(
	'Replenish',
	(supabase) => new ReplenishService(supabase),
	replenishPayloadBuilder,
	mReplenishInsertSchema
);

export const actions: Actions = {
	productUpsert: productCRUD.upsert,
	productDelete: productCRUD.delete,
	productPackingUpsert: productPackingCRUD.upsert,
	productPackingDelete: productPackingCRUD.delete,
	productPoUpsert: productPoCRUD.upsert,
	productPoDelete: productPoCRUD.delete,
	replenishUpsert: replenishCRUD.upsert,
	replenishDelete: replenishCRUD.delete
};
