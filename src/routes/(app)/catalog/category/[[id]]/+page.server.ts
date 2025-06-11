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

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
	if (!params.id) {
		throw error(400, 'Category ID is required');
	}

	const categoryId = parseInt(params.id);

	const { data: category } = await supabase
		.from('m_product_category')
		.select('*')
		.eq('id', categoryId)
		.maybeSingle();
	const { data: categories } = await supabase
		.from('m_product_category')
		.select('value:id, label:name')
		.order('name');
	const { data: priceFormulas } = await supabase
		.from('price_formulas')
		.select('value:id, label:name')
		.order('name');
	const { data: priceRules } = await supabase
		.from('price_rules')
		.select('*')
		.eq('m_product_category_id', categoryId);
	const { data: channelMapCategory } = await supabase
		.from('c_channel_map_category')
		.select('*')
		.eq('m_product_category_id', categoryId);
	const { data: channels } = await supabase.from('c_channel').select('label:name,value:id');

	return {
		formCategory: await superValidate(category, zod(mProductCategoryInsertSchema)),
		categories: categories || [],
		priceRules: priceRules || [],
		formPriceRules: await superValidate(zod(priceRulesInsertSchema)),
		priceFormulas: priceFormulas || [],
		channelMapCategory: channelMapCategory || [],
		formChannel: await superValidate(zod(cChannelMapCategoryInsertSchema)),
		channels: channels || []
	};
};

export const actions = {
	categoryUpsert: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const form = await superValidate(formData, zod(mProductCategoryInsertSchema));
		if (!form.valid) return fail(400, { form });
		console.log('form categoryUpsert:', form);

		if (!form.data.id) {
			console.log('Create Category');
			const { error: insertProductCategoryError } = await supabase
				.from('m_product_category')
				.insert(form.data);
			if (insertProductCategoryError) {
				throw error(400, insertProductCategoryError.message);
			}
			return message(form, 'Category created!');
		} else {
			// Update Category
			console.log('Update Category');
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
		console.log('form.data.id', form.data.id, typeof form.data.id);

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
