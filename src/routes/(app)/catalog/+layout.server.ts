import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import type { Warehouse } from './columns.svelte';
import { CategoryService } from '$lib/services/supabase/category.service';

let warehousesCache: Warehouse[] | [] = [];
export const load: LayoutServerLoad = async ({ url, depends, locals: { supabase } }) => {
	depends('catalog:categories');
	console.log('catalog:categories');

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

	const categoryService = new CategoryService(supabase);

	return {
		categories: await categoryService.getCategoryTree(),
		warehouses: await getWarehouses(),
		activeWarehouse
	};
};
