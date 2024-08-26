import type { PageServerLoad } from './$types';

export const load = (async ({ locals: { supabase } }) => {
	const { data } = await supabase.from('m_product_category').select('value:id,label:name');
	return { data };
}) satisfies PageServerLoad;
