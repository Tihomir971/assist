import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import type { Warehouse } from './columns.svelte';

let warehousesCache: Warehouse[] | [] = [];
export const load: LayoutServerLoad = async ({ url, locals: { supabase } }) => {
	// parent() previously returned categoryTree from root layout.
	// Category tree is now loaded client-side via the in-memory cache,
	// so we no longer rely on parent() for category data.

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
		// categories moved to client-side in-memory cache
		warehouses: await getWarehouses(),
		activeWarehouse
	};
};
