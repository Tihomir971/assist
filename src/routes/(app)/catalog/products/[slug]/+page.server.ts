import { fail, error } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getNumber, getString } from '$lib/scripts/getForm';
import { ProductService } from '$lib/services/supabase/';

import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { crudMProductSchema, mProductSchema } from '$lib/types/supabase/product.validator.js';
import { crudmProductPoSchema, mProductPoSchema } from '$lib/types/supabase/mProductPo.validator';
import {
	crudGtinSchema,
	crudReplenishSchema,
	replenishSchema,
	type CrudReplenishSchema
} from '../zod.validator';
import type { Database } from '$lib/types/supabase';
import type { ChartData } from '$lib/types/connector';
import { connector } from '$lib/ky';
import type { PostgrestError } from '@supabase/supabase-js';
import { log } from 'console';

export const load = (async ({ depends, params, locals: { supabase } }) => {
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
		(await supabase.from('m_product_category').select('value:id::text, label:name').order('name'))
			.data || [],
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
				.select(
					'id,m_warehouse_id,m_product_id,level_max,level_min,m_warehousesource_id,qtybatchsize'
				)
				.eq('m_product_id', productId)
				.order('m_warehouse_id')
		).data || [],
		(await supabase.from('m_warehouse').select('value:id, label:name')).data || [],
		ProductService.getProductPurchasing(supabase, productId),
		(
			await supabase
				.from('m_product_gtin')
				.select('id,gtin,m_product_id')
				.eq('m_product_id', productId)
		).data || [],
		(await supabase.from('c_taxcategory').select('value:id::text, label:name').order('name'))
			.data || [],
		(
			await supabase
				.from('m_product_po')
				.select('id, m_product_id, vendorproductno, c_bpartner(id, name), pricelist, updated, url')
				.eq(' m_product_id', productId)
		).data || [],
		(await connector.get(`api/sales/${product?.sku}/2`).json<ChartData>()) || [],
		(
			await supabase
				.from('m_storageonhand')
				.select('warehouse_id, qtyonhand')
				.eq('m_product_id', productId)
		).data || []
	]);

	const formProduct = await superValidate(product, zod(crudMProductSchema));
	const formProductPO = await superValidate(zod(crudmProductPoSchema));
	const formProductGtin = await superValidate({ barcodes }, zod(crudGtinSchema));
	const formReplenish = await superValidate({ replenishes }, zod(crudReplenishSchema));

	return {
		formProduct,
		productPurchasing,
		formProductGtin,
		formReplenish,
		uom,
		categories,
		warehouses,
		tax,
		salesByWeeks
	};
}) satisfies PageServerLoad;

export const actions = {
	productUPD: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(mProductSchema));
		if (!form.valid) return fail(400, { form });

		const { created, updated, ...updateData } = form.data;
		const { error } = await supabase.from('m_product').update(updateData).eq('id', form.data.id);

		if (error) {
			return fail(500, { form, error: error.message });
		}

		return { form };
	},

	replenishUPD: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(crudReplenishSchema));
		if (!form.valid) return fail(400, { form });

		try {
			// Separate records into updates and inserts
			const updatesToProcess = form.data.replenishes.filter((r) => r.id !== undefined);
			const insertsToProcess = form.data.replenishes.filter((r) => r.id === undefined);

			// Perform updates
			if (updatesToProcess.length > 0) {
				// Use Promise.all to update multiple records concurrently
				const updatePromises = updatesToProcess.map((r) =>
					supabase.from('m_replenish').update(r).eq('id', r.id!)
				);

				const updateResults = await Promise.all(updatePromises);

				// Check for any errors in the updates
				const updateErrors = updateResults.filter((result) => result.error);
				if (updateErrors.length > 0) {
					throw updateErrors[0].error;
				}
			}

			// Perform inserts
			if (insertsToProcess.length > 0) {
				const { error: insertError } = await supabase.from('m_replenish').insert(
					insertsToProcess.map((r) => ({
						...r
					}))
				);

				if (insertError) throw insertError;
			}
		} catch (error) {
			console.error('Replenish update error:', error);
			return fail(500, {
				form,
				error: error instanceof Error ? error.message : 'Unknown error occurred'
			});
		}

		return { form };
	},

	gtinUPD: async ({ request, locals: { supabase } }) => {
		console.log('gtinUPD');
		const form = await superValidate(request, zod(crudGtinSchema));
		if (!form.valid) {
			console.error('Form validation failed:', form.errors);
			return fail(400, { form });
		}
		try {
			// Separate records into updates and inserts
			const updatesToProcess = form.data.barcodes.filter((r) => r.id !== undefined);
			const insertsToProcess = form.data.barcodes.filter((r) => r.id === undefined);

			// Perform updates
			if (updatesToProcess.length > 0) {
				// Use Promise.all to update multiple records concurrently
				const updatePromises = updatesToProcess.map((r) =>
					supabase.from('m_product_gtin').update(r).eq('id', r.id!)
				);

				const updateResults = await Promise.all(updatePromises);

				// Check for any errors in the updates
				const updateErrors = updateResults.filter((result) => result.error);
				if (updateErrors.length > 0) {
					throw updateErrors[0].error;
				}
			}

			// Perform inserts
			if (insertsToProcess.length > 0) {
				const { error: insertError } = await supabase.from('m_product_gtin').insert(
					insertsToProcess.map((r) => ({
						...r
					}))
				);

				if (insertError) throw insertError;
			}
		} catch (error) {
			console.error('Replenish update error:', error);
			return fail(500, {
				form,
				error: error instanceof Error ? error.message : 'Unknown error occurred'
			});
		}

		return { form };
	}
} satisfies Actions;
