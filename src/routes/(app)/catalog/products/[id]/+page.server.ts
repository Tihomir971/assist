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
	AttributeService,
	ProductPackingService,
	ProductPoService,
	ReplenishService,
	BrandService, // Added BrandService
	ProductAttributeOptionService,
	ProductAttributeValueService,
	AttributeSetAttributeService
} from '$lib/services/supabase';
import { TaxCategoryService, StorageOnHandService } from '$lib/services/supabase/';
import {
	mProductInsertSchema,
	mProductPackingInsertSchema,
	mProductPoInsertSchema,
	mReplenishInsertSchema,
	mProductAttributeOptionInsertSchema,
	mProductAttributeValueInsertSchema
} from '$lib/types/supabase.zod.schemas';
import { productPayloadBuilder } from './product.payload';
import { productPackingPayloadBuilder } from './product-packing.payload';
import { productPoPayloadBuilder } from './product-po.payload';
import { replenishPayloadBuilder } from './replenish.payload';
import { productAttributeOptionPayloadBuilder } from './product-attribute-option.payload';
import { productAttributeValuePayloadBuilder } from './product-attribute-value.payload';
import { connector } from '$lib/ky';
import type { ChartData } from '$lib/components/charts/chart-types';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ depends, params, locals: { supabase } }) => {
	depends('catalog:product');

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
		brands, // Added brands
		productAttributeValues,
		productAttributeOptions,
		attributeSetAttributes
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
		new BrandService(supabase).getLookup(), // Fetch product brands
		new ProductAttributeValueService(supabase).getByProductId(productId),
		new ProductAttributeOptionService(supabase).getByProductId(productId),
		product.attributeset_id
			? new AttributeSetAttributeService(supabase).getByAttributeSetId(product.attributeset_id)
			: Promise.resolve([])
	]);

	const attributeService = new AttributeService(supabase);
	const attributeOptionsLookup = new Map();

	if (attributeSetAttributes) {
		const optionBasedAttributes = attributeSetAttributes.filter(
			(attr) =>
				attr.m_attribute.attribute_type === 'single_select' ||
				attr.m_attribute.attribute_type === 'multi_select'
		);

		const optionsPromises = optionBasedAttributes.map((attr) =>
			attributeService.getAttributeOptions(attr.attribute_id)
		);

		const optionsResults = await Promise.all(optionsPromises);

		optionBasedAttributes.forEach((attr, index) => {
			attributeOptionsLookup.set(attr.attribute_id, optionsResults[index]);
		});
	}

	const [
		formProduct,
		formProductPacking,
		formReplenish,
		formProductPo,
		formProductAttributeValue,
		formProductAttributeOption
	] = await Promise.all([
		superValidate(product, zod(mProductInsertSchema)),
		superValidate(zod(mProductPackingInsertSchema)),
		superValidate(zod(mReplenishInsertSchema)),
		superValidate(zod(mProductPoInsertSchema)),
		superValidate(zod(mProductAttributeValueInsertSchema)),
		superValidate(zod(mProductAttributeOptionInsertSchema))
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
		productAttributeValues,
		formProductAttributeValue,
		productAttributeOptions,
		formProductAttributeOption,
		attributeSetAttributes,
		attributeOptionsLookup,
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
	replenishDelete: replenishCRUD.delete,
	attributeValueUpsert: createSimpleCRUD(
		'ProductAttributeValue',
		(supabase) => new ProductAttributeValueService(supabase),
		productAttributeValuePayloadBuilder,
		mProductAttributeValueInsertSchema
	).upsert,
	attributeOptionUpsert: createSimpleCRUD(
		'ProductAttributeOption',
		(supabase) => new ProductAttributeOptionService(supabase),
		productAttributeOptionPayloadBuilder,
		mProductAttributeOptionInsertSchema
	).upsert
};
