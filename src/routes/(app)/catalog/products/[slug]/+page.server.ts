import { fail, error } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getNumber, getString } from '$lib/scripts/getForm';
import { ProductService } from '$lib/services/supabase/';
import { ProductInfo } from '$lib/services/scraper';

import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { crudMProductSchema, mProductSchema } from '$lib/types/supabase/product.validator.js';
import { crudmProductPoSchema, mProductPoSchema } from '$lib/types/supabase/mProductPo.validator';
import { crudProductGtinSchema, replenishSchema } from '../zod.validator';
import type { Database } from '$lib/types/supabase';
import type { SalesByWeekApi } from '$lib/types/connector';
import { connector } from '$lib/ky';

type Replenish = Database['public']['Tables']['m_replenish']['Insert'];

export const load = (async ({ depends, params, locals: { supabase }, fetch }) => {
	depends('catalog:product');

	const productId = params.slug as unknown as number;
	const { data: product, error: productError } = await supabase
		.from('m_product')
		.select()
		.eq('id', productId)
		.single();

	if (!product || productError) {
		throw error(404, 'Product not found');
	}

	const [
		uom,
		categories,
		c_bpartner,
		replenishes,
		warehouses,
		productPurchasing,
		barcodes,
		tax,
		m_product_po,
		salesByWeeks,
		stock
	] = await Promise.all([
		ProductService.getUom(supabase),
		(await supabase.from('m_product_category').select('value:id, label:name').order('name')).data ||
			[],
		(
			await supabase
				.from('c_bpartner')
				.select('value:id, label:name')
				.eq('isvendor', true)
				.order('name')
		).data || [],
		(
			await supabase
				.from('m_replenish')
				.select('*')
				.eq('m_product_id', productId)
				.order('m_warehouse_id')
		).data || [],
		(await supabase.from('m_warehouse').select('value:id, label:name')).data || [],
		ProductService.getProductPurchasing(supabase, productId),
		(await supabase.from('m_product_gtin').select('*').eq('m_product_id', productId)).data || [],
		(await supabase.from('c_taxcategory').select('value:id, label:name').order('name')).data || [],
		(
			await supabase
				.from('m_product_po')
				.select('id, m_product_id, vendorproductno, c_bpartner(id, name), pricelist, updated, url')
				.eq(' m_product_id', productId)
		).data || [],
		(await connector.get(`api/sales/${product?.sku}`).json<SalesByWeekApi>()) || [],
		(
			await supabase
				.from('m_storageonhand')
				.select('warehouse_id, qtyonhand')
				.eq('m_product_id', productId)
		).data || []
	]);

	const formProduct = await superValidate(product, zod(crudMProductSchema));
	const formProductPO = await superValidate(zod(crudmProductPoSchema));
	const formProductGtin = await superValidate(zod(crudProductGtinSchema));
	const formReplenish = await superValidate({ replenishes }, zod(replenishSchema));

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
		m_product_po,
		salesByWeeks,
		stock
	};
}) satisfies PageServerLoad;

// Helper function to remove undefined values from an object
const removeUndefinedValues = <T extends Record<string, any>>(obj: T): T => {
	return Object.fromEntries(Object.entries(obj).filter(([_, value]) => value !== undefined)) as T;
};

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
				return fail(404, { delProductError });
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
				return fail(400, { addProductPurchasingError });
			}
		}
	},

	modReplenish: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(replenishSchema));
		if (!form.valid) return fail(400, { form });

		const replenishes = form.data.replenishes as Replenish[];

		const toInsert: Replenish[] = [];
		const toUpdate: Replenish[] = [];

		for (const replenish of replenishes) {
			const cleanReplenish = removeUndefinedValues(replenish);
			if (!cleanReplenish.id) {
				if (cleanReplenish.m_warehouse_id !== 0) {
					toInsert.push(cleanReplenish);
				}
			} else {
				toUpdate.push(cleanReplenish);
			}
		}

		if (toInsert.length > 0) {
			console.log('toInsert', toInsert);
			const { data: insertData, error: insertError } = await supabase
				.from('m_replenish')
				.insert(toInsert)
				.select();
			console.log('insertData', insertData);

			if (insertError) {
				console.error(insertError);

				return fail(500, { form, error: 'Failed to insert new replenishes' });
			}
		}

		if (toUpdate.length > 0) {
			for (const replenish of toUpdate) {
				if (typeof replenish.id === 'number') {
					const { error: updateError } = await supabase
						.from('m_replenish')
						.update(replenish)
						.eq('id', replenish.id);
					if (updateError) {
						return fail(500, { form, error: `Failed to update replenish with id ${replenish.id}` });
					}
				} else {
					console.error('Replenish object has an invalid id:', replenish);
				}
			}
		}

		return { form };
	},

	deleteReplenish: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(replenishSchema));

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
