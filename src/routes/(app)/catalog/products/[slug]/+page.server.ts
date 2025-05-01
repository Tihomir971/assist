import { fail, error } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ProductService } from '$lib/services/supabase/';

import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { ChartData } from './chart-types';
import { connector } from '$lib/ky';
import {
	crudMProductSchema,
	crudReplenishSchema,
	mStorageonhandInsertSchemaАrray,
	productPackingDeleteSchema,
	productPackingInsertSchema
} from './schema.js';
import { mProductPoInsertSchema } from '$lib/types/supabase.zod.schemas';

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
				'id, m_warehouse_id, m_product_id, level_max, level_min, m_warehousesource_id, qtybatchsize'
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
			.order('packing_type', { ascending: false });
		return data || [];
	};

	const getTaxes = async () => {
		const { data } = await supabase
			.from('c_taxcategory')
			.select('value:id, label:name')
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
	const getAttributeSets = async () => {
		const { data } = await supabase
			.from('m_attributeset')
			.select('value:id, label:name')
			.order('name', { ascending: true });
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
		tax,
		salesByWeeks,
		storageonhand,
		attributeSets
	] = await Promise.all([
		ProductService.getUoms(supabase),
		getCategories(),
		getBPartner(),
		getReplenishes(),
		getWarehouses(),
		ProductService.getProductPurchasing(supabase, productId),
		getProductPacking(),
		getTaxes(),
		getSalesData(product.sku),
		getStorageOnHand(),
		getAttributeSets()
	]);

	const formProduct = await superValidate(product, zod(crudMProductSchema));
	const formProductPacking = await superValidate(zod(productPackingInsertSchema));
	formProductPacking.data.m_product_id = productId;
	const formReplenish = await superValidate({ replenishes }, zod(crudReplenishSchema));
	const formProductPo = await superValidate(
		zod(
			mProductPoInsertSchema // Add the new form schema import
		)
	); // Use the new form schema
	formProductPo.data.m_product_id = productId;

	const formStorageOnHand = await superValidate(
		{ storageonhand },
		zod(mStorageonhandInsertSchemaАrray)
	);

	return {
		productId,
		formProduct,
		formProductPo,
		purchases,
		formProductPacking,
		productPacking,
		formReplenish,
		formStorageOnHand,
		partners,
		uom,
		categories,
		warehouses,
		tax,
		salesByWeeks,
		attributeSets
	};
};

export const actions = {
	productPackingUpsert: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(productPackingInsertSchema));
		if (!form.valid) return fail(400, { form });

		if (!form.data.id) {
			// CREATE Barcode
			const { error } = await supabase.from('m_product_packing').insert({ ...form.data });
			console.log('error', error);

			if (error) {
				return fail(500, {
					form,
					message: error.message
				});
			}

			return message(form, 'Barcode created!');
		} else {
			// UPDATE Barcode
			const { error } = await supabase
				.from('m_product_packing')
				.update({ ...form.data })
				.eq('id', form.data.id as number);

			if (error) {
				console.log('error', error);

				return fail(500, {
					form,
					message: error.message
				});
			}
		}

		return message(form, 'Barcode updated!');
	},
	productPackingDelete: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(productPackingDeleteSchema));
		console.log('form', form);
		if (!form.valid) return fail(400, { form });

		const { error } = await supabase.from('m_product_packing').delete().eq('id', form.data.id);
		if (error) return fail(500, { form, message: error.message });

		return message(form, 'Product packaging deleted successfully!');
	},
	productUpsert: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(crudMProductSchema));

		if (!form.valid) return fail(400, { form });

		if (form.data.id) {
			const { error: updError } = await supabase
				.from('m_product')
				.update(form.data)
				.eq('id', form.data.id);
			if (updError) throw error(404, updError.message);
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

	mProductPoUpsert: async ({ request, locals: { supabase } }) => {
		console.log('Hello Vendors');

		const form = await superValidate(
			request,
			zod(
				mProductPoInsertSchema // Add the new form schema import
			)
		); // Use the explicit FormData object
		console.log('form.', JSON.stringify(form, null, 4));

		if (!form.valid) return fail(400, { form });

		if (form.data.id) {
			// UPDATE m_product_po
			const { id, ...updateData } = form.data;
			console.log('id, ...rest:', id, JSON.stringify(updateData, null, 2));
			const { error } = await supabase.from('m_product_po').update(updateData).eq('id', id);
			if (error) {
				console.log('error', error);
				return fail(500, {
					form,
					message: error.message
				});
			}
		} else {
			// INSERT m_product_po
			const { error } = await supabase.from('m_product_po').insert(form.data);
			if (error) {
				console.log('error', error);
				return fail(500, {
					form,
					message: error.message
				});
			}
		}

		return { form };
	}
} satisfies Actions;
