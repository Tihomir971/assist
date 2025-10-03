import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const search = url.searchParams.get('term');

	if (!search || search.length < 2) {
		return json({ products: [] });
	}

	const { data, error } = await supabase.rpc('search_products', { search_term: search });

	if (error) {
		console.error('Search error:', error);
		return json({ products: [], error: 'Search failed' }, { status: 500 });
	}

	return json({ products: data || [] });
};
