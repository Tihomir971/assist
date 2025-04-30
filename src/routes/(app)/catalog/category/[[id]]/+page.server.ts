import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { mProductCategoryInsertSchema } from '$lib/types/supabase/supabase-zod-schemas';

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
	const categoryId = params.id ? parseInt(params.id) : null;

	let category = null;
	if (categoryId !== null) {
		const { data } = await supabase
			.from('m_product_category')
			.select('*')
			.eq('id', categoryId)
			.maybeSingle();

		category = data;
	}

	const categories =
		(await supabase.from('m_product_category').select('value:id,label:name').order('name')).data ||
		[];

	const formCategory = await superValidate(category, zod(mProductCategoryInsertSchema));

	return {
		formCategory,
		categories
	};
};

export const actions = {
	categoryUpsert: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();

		const form = await superValidate(formData, zod(mProductCategoryInsertSchema));
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
