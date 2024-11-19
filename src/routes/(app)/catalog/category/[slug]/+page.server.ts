import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { log } from 'console';
import { crudMProductCategorySchema } from './schema';

export const load = (async ({ params, locals: { supabase } }) => {
	const categoryId = params.slug as unknown as number;
	const { data: category } = await supabase
		.from('m_product_category')
		.select('*')
		.eq('id', categoryId)
		.maybeSingle();
	if (params.slug && !category) throw error(404, 'User not found.');

	const categories =
		(await supabase.from('m_product_category').select('value:id::text,label:name').order('name'))
			.data || [];

	const formCategory = await superValidate(category, zod(crudMProductCategorySchema));

	return {
		formCategory,
		categories
	};
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();

		const form = await superValidate(formData, zod(crudMProductCategorySchema));
		if (!form.valid) return fail(400, { form });

		if (!form.data.id) {
			console.log('Create Category');

			// CREATE user
			//const user = { ...form.data, id: userId() };
			//users.push(user);
			//
			//return message(form, 'User created!');
		} else {
			//const index = users.findIndex((u) => u.id == form.data.id);
			//if (index == -1) throw error(404, 'User not found.');

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
		//if (form.data.id) {
		//	if (formData.has('delete')) {
		//		console.log('Deleting Category', form.data.id);
		//		// DELETE
		//		const { error: deleteProductCategoryError } = await supabase
		//			.from('m_product_category')
		//			.delete()
		//			.eq('id', form.data.id);
		//		if (deleteProductCategoryError) {
		//			console.log('deleteProductCategoryError', deleteProductCategoryError);
		//
		//			return fail(500, { supabaseErrorMessage: deleteProductCategoryError.message });
		//		}
		//		throw redirect(303, '/catalog/test-table');
		//	} else {
		//		const { created, updated, ...updateData } = form.data;
		//		const { error: updateProductCategoryError } = await supabase
		//			.from('m_product_category')
		//			.update(updateData)
		//			.eq('id', form.data.id);
		//
		//		if (updateProductCategoryError) {
		//			console.log('updateProductCategoryError', updateProductCategoryError);
		//
		//			return fail(500, { supabaseErrorMessage: updateProductCategoryError.message });
		//		}
		//	}
		//}
		return { form };
	}
} satisfies Actions;
