import { message, superValidate } from 'sveltekit-superforms';
import { zod, zod4 } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	cChannelMapCategoryInsertSchema,
	mProductCategoryInsertSchema,
	priceRulesInsertSchema
} from '$lib/types/supabase.zod.schemas';
import { deleteByIdSchema } from '$lib/types/zod-delete-by-id';
import type { Tables } from '$lib/types/supabase.types';

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
	let category = null;
	let priceRules: Tables<'price_rules'>[] = [];
	let channelMapCategory: Tables<'c_channel_map_category'>[] = [];
	let categoryId: number | null = null;

	if (params.id) {
		categoryId = parseInt(params.id);
		if (isNaN(categoryId)) {
			throw error(400, 'Invalid Category ID');
		}

		const { data: fetchedCategory } = await supabase
			.from('m_product_category')
			.select('*')
			.eq('id', categoryId)
			.maybeSingle();
		category = fetchedCategory;

		if (category) {
			const { data: fetchedPriceRules } = await supabase
				.from('price_rules')
				.select('*')
				.eq('m_product_category_id', categoryId);
			priceRules = fetchedPriceRules || [];

			const { data: fetchedChannelMapCategory } = await supabase
				.from('c_channel_map_category')
				.select('*')
				.eq('m_product_category_id', categoryId);
			channelMapCategory = fetchedChannelMapCategory || [];
		} else if (params.id) {
			// Only throw 404 if an ID was provided but no category found
			throw error(404, 'Category not found');
		}
	}

	// Common data needed for both create and edit
	const { data: categories } = await supabase
		.from('m_product_category')
		.select('value:id, label:name')
		.order('name');
	const { data: priceFormulas } = await supabase
		.from('price_formulas')
		.select('value:id, label:name')
		.order('name');
	const { data: channels } = await supabase.from('c_channel').select('label:name,value:id');

	return {
		formCategory: await superValidate(category, zod(mProductCategoryInsertSchema)),
		categories: categories || [],
		priceRules,
		formPriceRules: await superValidate(zod(priceRulesInsertSchema)), // For new price rules
		priceFormulas: priceFormulas || [],
		channelMapCategory,
		formChannel: await superValidate(zod(cChannelMapCategoryInsertSchema)), // For new channel maps
		channels: channels || []
	};
};

export const actions = {
	categoryUpsert: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(mProductCategoryInsertSchema));
		if (!form.valid) return fail(400, { form });

		if (!form.data.id) {
			// Create Category
			const { data: newCategory, error: insertProductCategoryError } = await supabase
				.from('m_product_category')
				.insert(form.data)
				.select('id')
				.single();

			if (insertProductCategoryError) {
				console.error('Insert Category Error:', insertProductCategoryError);
				return message(
					form,
					{ type: 'error', text: insertProductCategoryError.message },
					{ status: 400 }
				);
			}
			if (!newCategory || !newCategory.id) {
				console.error('Insert Category Error: No ID returned after insert');
				return message(
					form,
					{ type: 'error', text: 'Failed to retrieve new category ID after creation.' },
					{ status: 500 }
				);
			}
			// Assign the new ID to the form data to be returned
			form.data.id = newCategory.id;
			return message(form, 'Category created!');
		} else {
			// Update Category
			const { error: updateProductCategoryError } = await supabase
				.from('m_product_category')
				.update(form.data)
				.eq('id', form.data.id);
			if (updateProductCategoryError) {
				throw error(404, updateProductCategoryError.message);
			}
			return message(form, 'Category updated!');
		}
	},
	categoryDelete: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod4(deleteByIdSchema));
		if (!form.valid) return fail(400, { form });

		const { error: delError } = await supabase
			.from('m_product_category')
			.delete()
			.eq('id', form.data.id);

		if (delError) {
			return message(form, { message: delError });
		}
		throw redirect(303, '/catalog');
	},
	priceRulesUpsert: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(priceRulesInsertSchema));
		if (!form.valid) return fail(400, { form });

		if (!form.data.id) {
			console.log('Create Category');
			const { error: insertError } = await supabase.from('price_rules').insert(form.data);
			if (insertError) {
				throw error(400, insertError.message);
			}
			return message(form, 'Category created!');
		} else {
			console.log('Update Category');
			// UPDATE Category
			const { error: updateError } = await supabase
				.from('price_rules')
				.update(form.data)
				.eq('id', form.data.id);

			if (updateError) {
				throw error(404, updateError.message);
			}
			return message(form, 'Category updated!');
		}
	},
	priceRulesDelete: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod4(deleteByIdSchema));
		if (!form.valid) return fail(400, { form });
		const { error: deleteError } = await supabase
			.from('price_rules')
			.delete()
			.eq('id', form.data.id);
		if (deleteError) {
			throw error(400, deleteError.message);
		}
		return message(form, 'Price rule deleted!');
	},
	channelMapUpsert: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(cChannelMapCategoryInsertSchema));
		if (!form.valid) return fail(400, { form });

		if (!form.data.id) {
			// Create Channel Map
			const { error: insertError } = await supabase
				.from('c_channel_map_category')
				.insert(form.data);
			if (insertError) {
				console.error('Insert Channel Map Error:', insertError);
				return message(form, { type: 'error', text: insertError.message });
			}
			return message(form, 'Channel mapping created!');
		} else {
			// Update Channel Map
			const { error: updateError } = await supabase
				.from('c_channel_map_category')
				.update(form.data)
				.eq('id', form.data.id);

			if (updateError) {
				console.error('Update Channel Map Error:', updateError);
				return message(form, { type: 'error', text: updateError.message });
			}
			return message(form, 'Channel mapping updated!');
		}
	},
	channelMapDelete: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod4(deleteByIdSchema));
		if (!form.valid) return fail(400, { form });
		const { error: deleteError } = await supabase
			.from('c_channel_map_category')
			.delete()
			.eq('id', form.data.id);
		if (deleteError) {
			console.error('Delete Channel Map Error:', deleteError);
			return message(form, { type: 'error', text: deleteError.message });
		}
		return message(form, 'Channel mapping deleted!');
	}
} satisfies Actions;
