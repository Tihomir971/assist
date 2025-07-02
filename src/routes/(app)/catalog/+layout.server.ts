import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import type { Warehouse } from './columns.svelte';

let warehousesCache: Warehouse[] | [] = [];
export const load: LayoutServerLoad = async ({ url, parent, locals: { supabase } }) => {
	const { categoryTree } = await parent();
	console.log('categoryTreeLayout');

	const whParam = url.searchParams.get('wh');
	if (!whParam) {
		const newUrl = new URL(url);
		newUrl.searchParams.set('wh', '5');
		throw redirect(302, newUrl.toString());
	}
	const activeWarehouse = parseInt(whParam);

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
		categories: categoryTree,
		warehouses: await getWarehouses(),
		activeWarehouse
	};
};
