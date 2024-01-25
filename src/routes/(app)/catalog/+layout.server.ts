import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ depends, locals: { supabase, getSession } }) => {
	const session = await getSession();
	if (!session) {
		redirect(303, '/auth');
	}

	/* 	const paramsCategory = url.searchParams.get('onStock');
	const defaultExpanded: number[] = [];
 */
	/* 	if (paramsCategory) {
		defaultExpanded.push(Number(paramsCategory));
	} */

	/* 	function getParentIds(categories: Category[], startCategoryId: number): number[] {
    let parentIds: number[] = [];
    let currentCategory = categories.find(category => category.id === startCategoryId);

    while (currentCategory && currentCategory.parent_id !== null) {
        parentIds.push(currentCategory.parent_id);
        currentCategory = categories.find(category => category.id === currentCategory.parent_id);
    }

    return parentIds;
} */

	depends('catalog:categories');
	const { data: categories } = await supabase
		.from('m_product_category')
		.select('id,parent_id, title:name')
		//.select('id,parent_id,content: name')
		.order('name');

	return { categories };
}) satisfies LayoutServerLoad;
