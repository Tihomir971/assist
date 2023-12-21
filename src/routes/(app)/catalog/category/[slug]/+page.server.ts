import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, locals: { supabase, getSession } }) => {
	const session = await getSession();
	if (!session) {
		throw error(401, { message: 'Unauthorized' });
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
