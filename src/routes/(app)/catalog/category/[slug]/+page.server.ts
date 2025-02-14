import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { crudCChannelMapCategorySchema, crudMProductCategorySchema } from './schema';

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
	const categoryId = params.slug as unknown as number;
	const { data: category } = await supabase
		.from('m_product_category')
		.select('*')
		.eq('id', categoryId)
		.maybeSingle();
	const { data: categoryMap } = await supabase
		.from('c_channel_map_category')
		.select('*')
		.eq('m_product_category_id', categoryId)
		.maybeSingle();
	//	if (params.slug && !category) throw error(404, 'User not found.');

	const categories =
		(await supabase.from('m_product_category').select('value:id,label:name').order('name')).data ||
		[];
	const channels =
		(await supabase.from('c_channel').select('value:id::text,label:name').order('name')).data || [];

	const formCategory = await superValidate(category, zod(crudMProductCategorySchema));
	const formCategoryMap = await superValidate(categoryMap, zod(crudCChannelMapCategorySchema));

	return {
		formCategory,
		formCategoryMap,
		categories,
		channels
	};
};

export const actions = {
	default: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();

		const form = await superValidate(formData, zod(crudMProductCategorySchema));
		if (!form.valid) return fail(400, { form });
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
			if (formData.has('delete')) {
				console.log('Delete Category');
				// DELETE Category
				const { error: deleteProductCategoryError } = await supabase
					.from('m_product_category')
					.delete()
					.eq('id', form.data.id);
				if (deleteProductCategoryError) {
					console.log('deleteProductCategoryError', deleteProductCategoryError);

					return fail(500, { supabaseErrorMessage: deleteProductCategoryError.message });
				}
				throw redirect(303, '/catalog/products');
			} else {
				console.log('Update Category');
				// UPDATE Category
				const { error: updateProductCategoryError } = await supabase
					.from('m_product_category')
					.update(form.data)
					.eq('id', form.data.id);

				if (updateProductCategoryError) {
					throw error(404, updateProductCategoryError.message);
				}
				return message(form, 'User updated!');
			}
		}
	}
} satisfies Actions;
