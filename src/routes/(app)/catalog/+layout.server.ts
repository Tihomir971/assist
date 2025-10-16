import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
// import type { Warehouse } from './columns.svelte';
import { validateSearchParams } from 'runed/kit';
import { catalogSearchParamsSchema } from './schema.search-params';

// let warehousesCache: Warehouse[] | [] = [];
export const load: LayoutServerLoad = async ({ url }) => {
	const { data: dataSearchParams } = validateSearchParams(url, catalogSearchParamsSchema);
	const { wh: activeWarehouse } = dataSearchParams;
	if (!activeWarehouse) {
		const newUrl = new URL(url);
		newUrl.searchParams.set('wh', '5');
		throw redirect(302, newUrl.toString());
	}

	/* 	async function getWarehouses(): Promise<Warehouse[]> {
		if (warehousesCache.length > 0) return warehousesCache;

		const { data } = await supabase
			.from('m_warehouse')
			.select('value:id::text, label:name')
			.order('name');
		warehousesCache = data || [];
		return warehousesCache;
	} */

	return {
		// categories moved to client-side in-memory cache
		activeWarehouse
	};
};
