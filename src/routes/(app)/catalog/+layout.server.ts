import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import type { Warehouse } from './columns.svelte';

let warehousesCache: Warehouse[] | [] = [];
export const load: LayoutServerLoad = async ({ url, depends, locals: { supabase } }) => {
	depends('catalog:categories');
	const whParam = url.searchParams.get('wh');
	if (!whParam) {
		const newUrl = new URL(url);
		newUrl.searchParams.set('wh', '5');
		throw redirect(302, newUrl.toString());
	}
	const activeWarehouse = parseInt(whParam);

	const activeCategory = () => {
		const param = url.searchParams.get('cat');
		return param ? Number(param) : null;
	};

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

	const { data: categories } = await supabase
		.from('m_product_category')
		.select('id,parent_id, title:name')
		.order('name');

	async function getWarehouses(): Promise<Warehouse[]> {
		if (warehousesCache.length > 0) return warehousesCache;

		const { data } = await supabase
			.from('m_warehouse')
			.select('value:id::text, label:name')
			.order('name');
		warehousesCache = data || [];
		return warehousesCache;
	}

	return {
		categories: categories || [],
		expanded: findParents(categories, activeCategory()),
		warehouses: await getWarehouses(),
		activeWarehouse
	};
};
