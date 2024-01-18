import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getBoolean, getNumber, getString } from '$lib/scripts/getForm';
import type { Tables } from '$lib/types/database.types';

export const load = (async ({ params, locals: { supabase, getSession } }) => {
	const session = await getSession();
	if (!session) {
		error(401, { message: 'Unauthorized' });
	}
	const categoryId = params.slug as unknown as number;
	const getCategory = async (id: number) => {
		const { data } = await supabase.from('m_product_category').select().eq('id', id).maybeSingle();

		return data;
	};

	const getCategories = async () => {
		const { data } = await supabase
			.from('m_product_category')
			.select('value:id,label:name')
			.order('name');
		/* .returns<AutocompleteOption<string>[]>(); */
		return data;
	};

	return {
		category: await getCategory(categoryId),
		categories: await getCategories()
	};
}) satisfies PageServerLoad;

export const actions = {
	setCategory: async ({ request, locals: { supabase, getSession } }) => {
		const session = await getSession();
		if (!session) {
			error(401, { message: 'Unauthorized' });
		}
		const category: Partial<Tables<'m_product_category'>> = {};
		/* let temporary: FormDataEntryValue | null; */
		const formData = await request.formData();

		const productId = getNumber(formData, 'id');
		category.description = getString(formData, 'description');
		category.name = getString(formData, 'name') ?? undefined;
		category.parent_id = getNumber(formData, 'parent_id') ?? undefined;
		category.isselfservice = getBoolean(formData, 'isselfservice');
		category.isactive = getBoolean(formData, 'isactive');
		if (productId) {
			const { error: createPostError } = await supabase
				.from('m_product_category')
				.update(category)
				.eq('id', productId);

			if (createPostError) {
				return fail(500, { supabaseErrorMessage: createPostError.message });
			}
		}
		return { success: true };
	}
} satisfies Actions;
