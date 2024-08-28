import { fail } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getNumber, getString } from '$lib/scripts/getForm';
import { ProductService, WarehouseService } from '$lib/services/supabase/';
import { ProductInfo } from '$lib/services/scraper';

import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { crudMProductSchema, mProductSchema } from '$lib/types/supabase/product.validator.js';
import { crudmProductPoSchema, mProductPoSchema } from '$lib/types/supabase/mProductPo.validator';
import {
	crudProductGtinSchema,
	deleteReplenishSchema,
	replenishSchema,
	updateReplenishSchema
} from '../zod.validator';

export const load = (async ({ depends, params, locals: { supabase } }) => {
	depends('catalog:product');

	const productId = params.slug as unknown as number;

	const [
		product,
		uom,
		categories,
		c_bpartner,
		replenishes,
		warehouses,
		productPurchasing,
		barcodes,
		tax,
		m_product_po
	] = await Promise.all([
		ProductService.getProduct(supabase, productId),
		ProductService.getUom(supabase),
		/* CategoryService.getCategories(supabase), */
		(await supabase.from('m_product_category').select('value:id, label:name').order('name')).data ||
			[],
		(
			await supabase
				.from('c_bpartner')
				.select('value:id, label:name')
				.eq('isvendor', true)
				.order('name')
		).data || [],
		(await supabase.from('m_replenish').select('*').eq('m_product_id', productId)).data || [],
		(await supabase.from('m_warehouse').select('value:id, label:name')).data || [],
		/* WarehouseService.getWarehouses(supabase), */
		ProductService.getProductPurchasing(supabase, productId),
		(await supabase.from('m_product_gtin').select('*').eq('m_product_id', productId)).data || [],
		(await supabase.from('c_taxcategory').select('value:id, label:name').order('name')).data || [],
		(
			await supabase
				.from('m_product_po')
				.select('id, m_product_id, vendorproductno, c_bpartner(id, name), pricelist, updated, url')
				.eq(' m_product_id', productId)
		).data || []
	]);

	const formProduct = await superValidate(product, zod(crudMProductSchema));
	const formProductPO = await superValidate(zod(crudmProductPoSchema));
	const formProductGtin = await superValidate(zod(crudProductGtinSchema));
	const formReplenish = await superValidate(zod(replenishSchema));

	return {
		formProduct,
		formProductPO,
		formProductGtin,
		formReplenish,
		barcodes,
		uom,
		categories,
		productPurchasing,
		c_bpartner,
		replenishes,
		warehouses,
		tax,
		m_product_po
	};
}) satisfies PageServerLoad;

export const actions = {
	updateProduct: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(mProductSchema));
		if (!form.valid) return fail(400, { form });

		// Remove created and updated from the data to be updated
		const { created, updated, ...updateData } = form.data;

		const { error } = await supabase.from('m_product').update(updateData).eq('id', form.data.id);

		if (error) {
			return fail(500, { form, error: error.message });
		}

		return { form };
	},
	deleteProduct: async ({ request, locals: { supabase } }) => {
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

	addProductPO: async ({ request, locals: { supabase } }) => {
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
	addReplenish: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(updateReplenishSchema));
		if (!form.valid) return fail(400, { form });

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
	updReplenish: async ({ request, locals: { supabase } }) => {
		console.log('UPD Replenish');
		const form = await superValidate(request, zod(updateReplenishSchema));
		console.log('POST', form);
		if (!form.valid) return fail(400, { form });

		const { ...updateData } = form.data;

		if (updateData.id) {
			const { error: cReplenishError } = await supabase
				.from('m_replenish')
				.update(updateData)
				.eq('id', updateData.id);
			if (cReplenishError) {
				return fail(400, cReplenishError);
			}
		}
	},
	deleteReplenish: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(deleteReplenishSchema));

		if (!form.valid) {
			return fail(400, { form });
		}
		console.log('deleting....', form.id);

		/* try {
			const { error } = await supabase.from('m_replenish').delete().eq('id', form.data.id);
			if (error) throw error;
			return { form };
		} catch (error) {
			console.error('Failed to delete replenish data:', error);
			return fail(500, { form, serverError: 'Failed to delete replenish data' });
		} */
	},
	getProductInfo: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(crudMProductSchema));
		//const formData = Object.fromEntries(await request.formData());
		if (form.data.id) {
			const data = await ProductInfo.getProductInfo(supabase, form.data.id);

			return data;
		}
	},
	mProductPo: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(crudmProductPoSchema));
		if (!form.valid) {
			console.error('Form validation failed:', form.errors);
			return fail(400, { form });
		}

		try {
			const { error: insertError } = await supabase.from('m_product_po').insert(form.data);
			if (insertError) throw insertError;
		} catch (error) {
			console.error('Database insertion failed:', error);
			return fail(500, { form, error: 'Failed to insert data' });
		}

		return { form };
	},
	mProductGtin: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(crudProductGtinSchema));
		if (!form.valid) {
			console.error('Form validation failed:', form.errors);
			return fail(400, { form });
		}

		try {
			const { error: insertError } = await supabase.from('m_product_gtin').insert(form.data);
			if (insertError) throw insertError;
		} catch (error) {
			console.error('Database insertion failed:', error);
			return fail(500, { form, error: 'Failed to insert data' });
		}

		return { form };
	},

	deleteProductGtin: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		if (id) {
			const { error } = await supabase.from('m_product_gtin').delete().eq('id', id);
			if (error) {
				console.error('Failed to delete product GTIN:', error);
				return fail(500, { error: 'Failed to delete product GTIN' });
			}
		}

		return { success: true };
	}
} satisfies Actions;
