import { fail, error, redirect } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ProductService } from '$lib/services/supabase/';

import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { ChartData } from './chart-types';
import { connector } from '$lib/ky';
import {
	crudMProductGtinSchema,
	crudMProductSchema,
	crudReplenishSchema,
	mProductPoInsertSchemaАrray,
	mStorageonhandInsertSchemaАrray
} from './schema';

export const load: PageServerLoad = async ({ depends, params, locals: { supabase } }) => {
	depends('catalog:products');

	const productId = parseInt(params.slug);
	const { data: product } = await supabase.from('m_product').select().eq('id', productId).single();
	if (!product) throw error(404, 'Product not found');

	const getCategories = async () => {
		const { data } = await supabase
			.from('m_product_category')
			.select('value:id, label:name')
			.order('name');
		return data || [];
	};
	const getBPartner = async () => {
		const { data } = await supabase
			.from('c_bpartner')
			.select('value:id, label:name')
			.eq('isvendor', true)
			.order('name');
		return data || [];
	};
	const getReplenishes = async () => {
		const { data } = await supabase
			.from('m_replenish')
			.select(
				'id,m_warehouse_id,m_product_id,level_max,level_min,m_warehousesource_id,qtybatchsize'
			)
			.eq('m_product_id', productId)
			.order('m_warehouse_id');
		return data || [];
	};
	const getWarehouses = async () => {
		const { data } = await supabase
			.from('m_warehouse')
			.select('value:id, label:name')
			.order('name');
		return data || [];
	};
	const getProductPacking = async () => {
		const { data } = await supabase
			.from('m_product_packing')
			.select('*')
			.eq('m_product_id', productId)
			.order('m_product_packing_type_id', { ascending: false });
		return data || [];
	};
	const getProductPackingType = async () => {
		const { data } = await supabase.from('m_product_packing_type').select('value:id,label:name');
		return data || [];
	};

	const getTaxes = async () => {
		const { data } = await supabase
			.from('c_taxcategory')
			.select('value:id::text, label:name')
			.order('name');
		return data || [];
	};
	const getSalesData = async (sku: string | null) => {
		if (!sku) {
			return { currentYear: new Date().getFullYear(), products: [] };
		}
		const { currentYear, products } = await connector
			.post('api/sales', {
				json: {
					productIds: [sku],
					yearCount: 3
				}
			})
			.json<ChartData>();
		return { currentYear, products };
	};
	const getStorageOnHand = async () => {
		const { data } = await supabase
			.from('m_storageonhand')
			.select('warehouse_id, qtyonhand,m_product_id')
			.eq('m_product_id', productId);
		return data || [];
	};
	const [
		uom,
		categories,
		partners,
		replenishes,
		warehouses,
		purchases,
		productPacking,
		productPackingType,
		tax,
		salesByWeeks,
		storageonhand
	] = await Promise.all([
		ProductService.getUom(supabase),
		getCategories(),
		getBPartner(),
		getReplenishes(),
		getWarehouses(),
		ProductService.getProductPurchasing(supabase, productId),
		getProductPacking(),
		getProductPackingType(),
		getTaxes(),
		getSalesData(product.sku),
		getStorageOnHand()
	]);

	const formProduct = await superValidate(product, zod(crudMProductSchema));
	const formProductPacking = await superValidate({ productPacking }, zod(crudMProductGtinSchema));
	const formReplenish = await superValidate({ replenishes }, zod(crudReplenishSchema));
	const formPurchasing = await superValidate({ purchases }, zod(mProductPoInsertSchemaАrray));
	const formStorageOnHand = await superValidate(
		{ storageonhand },
		zod(mStorageonhandInsertSchemaАrray)
	);

	return {
		productId,
		formProduct,
		formPurchasing,
		formProductPacking,
		productPackingType,
		formReplenish,
		formStorageOnHand,
		partners,
		uom,
		categories,
		warehouses,
		tax,
		salesByWeeks
	};
};

export const actions = {
	product: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(crudMProductSchema));
		if (!form.valid) return fail(400, { form });

		if (form.data.id) {
			if (formData.has('delete')) {
				const { error: delError } = await supabase
					.from('m_product')
					.delete()
					.eq('id', form.data.id);
				if (delError) throw error(404, delError.message);
				throw redirect(303, '/catalog');
			} else {
				const { error: updError } = await supabase
					.from('m_product')
					.update(form.data)
					.eq('id', form.data.id);
				if (updError) throw error(404, updError.message);
			}
		} else {
			const { error: insError } = await supabase.from('m_product').insert(form.data);
			if (insError) throw error(500, insError.message);
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
		const form = await superValidate(request, zod(crudMProductGtinSchema));
		if (!form.valid) {
			console.error('Form validation failed:', form.errors);
			return fail(400, { form });
		}
		try {
			// Separate records into updates and inserts
			const updatesToProcess = form.data.productPacking.filter((r) => r.id !== undefined);
			const insertsToProcess = form.data.productPacking.filter((r) => r.id === undefined);

			// Perform updates
			if (updatesToProcess.length > 0) {
				// Use Promise.all to update multiple records concurrently
				const updatePromises = updatesToProcess.map((r) =>
					supabase.from('m_product_packing').update(r).eq('id', r.id!)
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
				const { error: insertError } = await supabase.from('m_product_packing').insert(
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
	vendors: async ({ request, locals: { supabase } }) => {
		console.log('Hello Vendors');

		const form = await superValidate(request, zod(mProductPoInsertSchemaАrray));
		if (!form.valid) return fail(400, { form });

		// Create new array without created and updated fields
		const purchases = form.data.purchases.map(({ ...purchase }) => purchase);

		try {
			// Separate records into updates and inserts
			const updatesToProcess = purchases.filter((r) => r.id !== undefined);
			const insertsToProcess = purchases.filter((r) => r.id === undefined);

			// Perform updates
			if (updatesToProcess.length > 0) {
				// Use Promise.all to update multiple records concurrently
				const updatePromises = updatesToProcess.map((r) =>
					supabase.from('m_product_po').update(r).eq('id', r.id!)
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
				const { error: insertError } = await supabase.from('m_product_po').insert(
					insertsToProcess.map((r) => ({
						...r
					}))
				);

				if (insertError) throw insertError;
			}
		} catch (error) {
			console.error('Vendor update error:', error);
			return fail(500, {
				form,
				error: error instanceof Error ? error.message : 'Unknown error occurred'
			});
		}

		return { form };
	}
} satisfies Actions;
