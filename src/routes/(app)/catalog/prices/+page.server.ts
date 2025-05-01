import type { Tables } from '$lib/types/supabase.types';
import type { PageServerLoad } from './$types';

type PLVerison = Tables<'m_pricelist_version'>;
export const load = (async ({ url, locals: { supabase } }) => {
	const { data: pricelist, error } = await supabase.from('m_pricelist').select('*');

	const pricelist_version_id = url.searchParams.get('plid');
	let pricelist_version: PLVerison | null = null;
	if (pricelist_version_id) {
		const { data, error } = await supabase
			.from('m_pricelist_version')
			.select('*')
			.eq('id', parseInt(pricelist_version_id));
		if (error) throw error;
		pricelist_version = data?.[0] ?? null;
	}
	if (error) throw error;

	return { pricelist, pricelist_version };
}) satisfies PageServerLoad;
