import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ url, depends, locals: { supabase, getSession } }) => {
	const session = await getSession();
	if (!session) {
		redirect(303, '/auth');
	}
	const activeCategory = () => {
		const param = url.searchParams.get('cat');

		return param ? Number(param) : null;
	};

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
	type Category = {
		id: number;
		parent_id: number | null;
		title: string;
	};

	function findParents(categories: Category[] | null, id: number | null): string[] | undefined {
		if (!categories || !id) return undefined;

		let node = categories.find((category) => category?.id === id);
		const parents: string[] = [];

		while (node?.parent_id !== null) {
			const parent = categories.find((category) => category.id === node?.parent_id);
			if (!parent) break;
			parents.push(parent.id.toString());
			node = parent;
		}

		return parents.length > 0 ? parents : undefined;
	}
	depends('catalog:categories');
	const { data: categories } = await supabase
		.from('m_product_category')
		.select('id,parent_id, title:name')
		//.select('id,parent_id,content: name')
		.order('name');

	return { categories, expanded: findParents(categories, activeCategory()) };
}) satisfies LayoutServerLoad;
