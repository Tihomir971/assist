import { error, fail } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getNumber, getString } from '$lib/scripts/getForm';
import {
	CategoryService,
	PartnerService,
	ProductService,
	WarehouseService
} from '$lib/services/supabase/';
import { ProductInfo } from '$lib/services/scraper';

export const load = (async ({ depends, params, locals: { supabase, getSession } }) => {
	depends('catalog:product');
	const session = await getSession();
	if (!session) {
		error(401, { message: 'Unauthorized' });
	}
	const productId = params.slug as unknown as number;

	const [product, categories, partners, replenishes, warehouses, productPurchasing] =
		await Promise.all([
			ProductService.getProduct(supabase, productId),
			CategoryService.getCategories(supabase),
			PartnerService.getPartners(supabase),
			ProductService.getReplenishes(supabase, productId),
			WarehouseService.getWarehouses(supabase),
			ProductService.getProductPurchasing(supabase, productId)
		]);

	return {
		product,
		categories,
		productPurchasing,
		partners,
		replenishes,
		warehouses
	};
}) satisfies PageServerLoad;

export const actions = {
	updateProduct: async ({ request, locals: { supabase, getSession } }) => {
		const session = await getSession();
		if (!session) {
			error(401, { message: 'Unauthorized' });
		}

		const formData = Object.fromEntries(await request.formData());
		if (formData) {
			const productId = +formData.id;

			const sku = formData.sku ? formData.sku.toString() : null;
			const name = formData.name ? formData.name.toString() : undefined;
			const barcode = formData.barcode ? formData.barcode.toString() : null;
			const c_uom_id = formData.c_uom_id ? +formData.c_uom_id : undefined;
			const brand = formData.brand ? formData.brand.toString() : null;
			const mpn = formData.mpn ? formData.mpn.toString() : null;
			const m_product_category_id = formData.m_product_category_id
				? +formData.m_product_category_id
				: null;
			const condition = formData.condition ? formData.condition.toString() : null;
			const isselfservice = formData.isselfservice ? Boolean(formData.isselfservice) : undefined;
			const discontinued = formData.discontinued ? Boolean(formData.discontinued) : undefined;
			const isactive = formData.isactive ? Boolean(formData.isactive) : undefined;
			const unitsperpack = formData.unitsperpack ? +formData.unitsperpack : undefined;
			const descriptionurl = formData.descriptionurl ? formData.descriptionurl.toString() : null;

			if (productId) {
				const { error: updateProductError } = await ProductService.updProduct(supabase, productId, {
					sku,
					name,
					barcode,
					c_uom_id,
					brand,
					mpn,
					m_product_category_id,
					condition,
					isselfservice,
					discontinued,
					isactive,
					unitsperpack,
					descriptionurl
				});

				if (updateProductError) {
					return fail(400, updateProductError);
				}
			}
		}
	},
	deleteProduct: async ({ request, locals: { supabase, getSession } }) => {
		const session = await getSession();
		if (!session) {
			error(401, { message: 'Unauthorized' });
		}
		const formData = await request.formData();
		const formValue = formData.get('id');
		const productId = formValue ? +formValue : undefined;

		if (productId) {
			const { error: delProductError } = await ProductService.delProduct(supabase, productId);
			if (delProductError) {
				return fail(404, delProductError);
			}
		}
	},

	addProductPO: async ({ request, locals: { supabase, getSession } }) => {
		const session = await getSession();
		if (!session) {
			error(401, { message: 'Unauthorized' });
		}

		const formData = await request.formData();
		const c_bpartner_id = getNumber(formData, 'bpartner');
		const m_product_id = getNumber(formData, 'm_product_id');
		const vendorproductno = getString(formData, 'partnerPN');
		const url = getString(formData, 'url');

		if (m_product_id && c_bpartner_id && vendorproductno && url) {
			const { error: addProductPurchasingError } = await ProductService.addProductPurchasing(
				supabase,
				{
					m_product_id,
					c_bpartner_id,
					vendorproductno,
					url
				}
			);

			if (addProductPurchasingError) {
				return fail(400, addProductPurchasingError);
			}
		}
	},
	addReplenish: async ({ request, locals: { supabase, getSession } }) => {
		const session = await getSession();
		if (!session) {
			error(401, { message: 'Unauthorized' });
		}

		const formData = Object.fromEntries(await request.formData());
		const m_product_id = formData.m_product_id ? +formData.m_product_id : undefined;
		const m_warehouse_id = formData.m_warehouse_id ? +formData.m_warehouse_id : undefined;
		const level_min = formData.level_min ? +formData.level_min : undefined;
		const level_max = formData.level_max ? +formData.level_max : undefined;
		const qtybatchsize = formData.qtybatchsize ? +formData.qtybatchsize : undefined;
		const m_warehousesource_id = formData.m_warehousesource_id
			? +formData.m_warehousesource_id
			: undefined;

		if (m_product_id && m_warehouse_id) {
			const { error: cReplenishError } = await supabase.from('m_replenish').insert({
				m_product_id,
				m_warehouse_id,
				level_min,
				level_max,
				qtybatchsize,
				m_warehousesource_id
			});
			if (cReplenishError) {
				return fail(400, cReplenishError);
			}
		}
	},
	getProductInfo: async ({ request, locals: { supabase, getSession } }) => {
		console.log('in getProductInfo');
		const session = await getSession();
		if (!session) {
			error(401, { message: 'Unauthorized' });
		}
		const formData = Object.fromEntries(await request.formData());
		if (formData) {
			const productId = +formData.id;
			console.log('productId', productId);

			ProductInfo.getProductInfo(supabase, productId);
		}
	}
} satisfies Actions;
