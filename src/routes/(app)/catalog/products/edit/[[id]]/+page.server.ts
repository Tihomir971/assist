import { error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
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
	AttributeSetAttributeService,
	AttributeGroupService,
	ChannelMappingProductService, // Added ChannelMappingProductService
	ChannelService
} from '$lib/services/supabase';
import { TaxCategoryService, StorageOnHandService } from '$lib/services/supabase/';
import {
	mProductInsertSchema,
	mProductPackingInsertSchema,
	mProductPoInsertSchema,
	mReplenishInsertSchema,
	mProductAttributeOptionInsertSchema,
	mProductAttributeValueInsertSchema,
	cChannelMapProductInsertSchema // Added cChannelMapProductInsertSchema
} from '$lib/types/supabase.schemas';
import type { ApiResponseT } from '@tihomir971/assist-shared';
import type { CChannelMapProductRow } from '$lib/types/supabase.zod';
import { productPayloadBuilder } from './product.payload';
import { productPackingPayloadBuilder } from './product-packing.payload';
import { productPoPayloadBuilder } from './product-po.payload';
import { replenishPayloadBuilder } from './replenish.payload';
import { productAttributeOptionPayloadBuilder } from './product-attribute-option.payload';
import { productAttributeValuePayloadBuilder } from './product-attribute-value.payload';
import { channelMappingProductPayloadBuilder } from './channel-mapping-product.payload'; // Added channelMappingProductPayloadBuilder
import { connector } from '$lib/ky';
import type { EChartsData } from '$lib/components/charts/chart-types';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ depends, params, locals: { supabase } }) => {
	depends('catalog:product');

	const productId = params.id ? parseInt(params.id) : null;

	// Handle new product creation
	if (productId === null) {
		const [
			uom,
			categories,
			partners,
			warehouses,
			tax,
			attributeSets,
			brands,
			attributeGroups,
			channels
		] = await Promise.all([
			new ProductService(supabase).getUoms(),
			new CategoryService(supabase).getLookup(),
			new PartnerService(supabase).getLookup({ isvendor: true }),
			new WarehouseService(supabase).getLookup(),
			new TaxCategoryService(supabase).getLookup(),
			new AttributeSetService(supabase).getLookup(),
			new BrandService(supabase).getLookup(),
			new AttributeGroupService(supabase).getLookup(),
			new ChannelService(supabase).getChannelLookup()
		]);

		const [
			formProduct,
			formProductPacking,
			formReplenish,
			formProductPo,
			formProductAttributeValue,
			formProductAttributeOption,
			formChannelMapProduct
		] = await Promise.all([
			superValidate(zod4(mProductInsertSchema)),
			superValidate(zod4(mProductPackingInsertSchema)),
			superValidate(zod4(mReplenishInsertSchema)),
			superValidate(zod4(mProductPoInsertSchema)),
			superValidate(zod4(mProductAttributeValueInsertSchema)),
			superValidate(zod4(mProductAttributeOptionInsertSchema)),
			superValidate(zod4(cChannelMapProductInsertSchema))
		]);

		return {
			entity: null,
			formProduct,
			purchases: [],
			formProductPo,
			productPacking: [],
			formProductPacking,
			replenishes: [],
			formReplenish,
			storageonhand: [],
			productAttributeValues: [],
			formProductAttributeValue,
			productAttributeOptions: [],
			formProductAttributeOption,
			attributeSetAttributes: [],
			attributeOptionsLookup: new Map(),
			channelMapProduct: [],
			formChannelMapProduct,
			lookupData: {
				attributeGroups: attributeGroups || [],
				partners,
				uom,
				categories,
				warehouses,
				tax,
				attributeSets,
				brands,
				channels
			},
			salesByWeeks: { currentYear: new Date().getFullYear(), products: [] }
		};
	}

	// Handle existing product edit
	if (isNaN(productId)) {
		throw error(400, 'Invalid product ID');
	}

	const productService = new ProductService(supabase);
	const product = await productService.getById(productId);

	if (!product) {
		throw error(404, 'Product not found');
	}

	const getSalesData = async (sku: string | null): Promise<ApiResponseT<EChartsData>> => {
		if (!sku) return { data: { xAxis: { data: [] }, series: [] }, error: null };
		try {
			const data = await connector
				.post('api/sales', { json: { productIds: [sku], yearCount: 3 } })
				.json<ApiResponseT<EChartsData>>();
			return data;
		} catch (e) {
			console.error('Failed to fetch sales data', e);
			return { data: { xAxis: { data: [] }, series: [] }, error: null };
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
		attributeSetAttributes,
		attributeGroups,
		channelMapProduct,
		channels
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
			: Promise.resolve([]),
		new AttributeGroupService(supabase).getLookup(),
		new ChannelMappingProductService(supabase).list({ m_product_id: productId }),
		new ChannelService(supabase).getChannelLookup()
	]);

	const attributeService = new AttributeService(supabase);
	const attributeOptionsLookup = new Map();

	if (attributeSetAttributes) {
		const optionBasedAttributes = attributeSetAttributes.filter(
			(attr: (typeof attributeSetAttributes)[0]) =>
				attr.m_attribute.attribute_type === 'single_select' ||
				attr.m_attribute.attribute_type === 'multi_select'
		);

		const optionsPromises = optionBasedAttributes.map((attr: (typeof optionBasedAttributes)[0]) =>
			attributeService.getAttributeOptions(attr.attribute_id)
		);

		const optionsResults = await Promise.all(optionsPromises);

		optionBasedAttributes.forEach((attr: (typeof optionBasedAttributes)[0], index: number) => {
			attributeOptionsLookup.set(attr.attribute_id, optionsResults[index]);
		});
	}

	const [
		formProduct,
		formProductPacking,
		formReplenish,
		formProductPo,
		formProductAttributeValue,
		formProductAttributeOption,
		formChannelMapProduct
	] = await Promise.all([
		superValidate(product, zod4(mProductInsertSchema)),
		superValidate(zod4(mProductPackingInsertSchema)),
		superValidate(zod4(mReplenishInsertSchema)),
		superValidate(zod4(mProductPoInsertSchema)),
		superValidate(zod4(mProductAttributeValueInsertSchema)),
		superValidate(zod4(mProductAttributeOptionInsertSchema)),
		superValidate(zod4(cChannelMapProductInsertSchema))
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
		channelMapProduct,
		formChannelMapProduct,
		lookupData: {
			attributeGroups: attributeGroups || [],
			partners,
			uom,
			categories,
			warehouses,
			tax,
			attributeSets,
			brands, // Added brands to lookupData
			channels
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

const channelMappingProductCRUD = createSimpleCRUD<
	CChannelMapProductRow,
	typeof cChannelMapProductInsertSchema
>(
	'ChannelMappingProduct',
	(supabase) => new ChannelMappingProductService(supabase),
	channelMappingProductPayloadBuilder,
	cChannelMapProductInsertSchema
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
	attributeOptionUpsert: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const isMultiSelect = formData.get('is_multi_select') === 'true';

		if (isMultiSelect) {
			const productId = parseInt(formData.get('product_id') as string);
			const attributeId = parseInt(formData.get('attribute_id') as string);
			const selectedOptions = JSON.parse(
				(formData.get('selected_options') as string) || '[]'
			) as string[];

			if (isNaN(productId) || isNaN(attributeId)) {
				return fail(400, { message: 'Invalid product or attribute ID.' });
			}

			const service = new ProductAttributeOptionService(supabase);
			try {
				await service.upsertMultipleOptions(
					productId,
					attributeId,
					selectedOptions.map((id) => parseInt(id))
				);
				return { success: true };
			} catch (e) {
				console.error('Failed to save multi-select options:', e);
				const message = e instanceof Error ? e.message : 'An unknown error occurred.';
				return fail(500, { message: `Failed to save multi-select options: ${message}` });
			}
		} else {
			// Fallback to existing simple CRUD for single-select
			const simpleCrudAction = createSimpleCRUD(
				'ProductAttributeOption',
				(supabase) => new ProductAttributeOptionService(supabase),
				productAttributeOptionPayloadBuilder,
				mProductAttributeOptionInsertSchema
			).upsert;

			// Re-create a request object for the simple CRUD handler.
			// This is a bit of a workaround because we've already consumed the request body.
			const newRequest = new Request(request.url, {
				method: 'POST',
				headers: request.headers,
				body: new URLSearchParams(formData as unknown as Record<string, string>).toString()
			});
			Object.defineProperty(newRequest, 'formData', {
				value: async () => new URLSearchParams(formData as unknown as Record<string, string>)
			});

			const event = {
				request: newRequest,
				locals: { supabase }
			};

			return simpleCrudAction(event as Parameters<typeof simpleCrudAction>[0]);
		}
	},
	channelMapProductUpsert: channelMappingProductCRUD.upsert,
	channelMapProductDelete: channelMappingProductCRUD.delete
};
