import { getRequestEvent, query } from '$app/server';

export const getWarehousesLookup = query(async () => {
	const { locals } = getRequestEvent();

	const { data, error } = await locals.supabase
		.from('m_warehouse')
		.select('value:id::text, label:name')
		.eq('is_active', true)
		.order('name');

	if (error) {
		console.error('Failed to load warehouse lookup:', error);
		return [];
	}

	return data || [];
});
