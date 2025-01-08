import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { SupabaseTable } from '$lib/types/supabase.types';

export const load: PageServerLoad = async ({ locals }) => {
	const { supabase } = locals;

	const { data: pricelists, error: fetchError } = await supabase.from('m_pricelist').select('*');

	if (fetchError) {
		throw error(500, 'Error fetching price lists');
	}

	return {
		pricelists
	};
};

export const actions = {
	addPriceList: async ({ request, locals }) => {
		const { supabase } = locals;
		const formData = await request.formData();
		const name = formData.get('name') as string;

		if (!name) {
			return fail(400, { name, missing: true });
		}
		const pricelistData: SupabaseTable<'m_pricelist'>['Insert'] = {
			name: name,
			c_currency_id: 2
		};
		const { data, error: insertError } = await supabase
			.from('m_pricelist')
			.insert(pricelistData)
			.select()
			.single();

		if (insertError) {
			return fail(500, { name, error: 'Failed to add price list' });
		}

		return { success: true, pricelist: data };
	},

	deletePriceList: async ({ request, locals }) => {
		const { supabase } = locals;
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { id, missing: true });
		}

		const { error: deleteError } = await supabase
			.from('m_pricelist')
			.delete()
			.eq('id', parseInt(id));

		if (deleteError) {
			return fail(500, { id, error: 'Failed to delete price list' });
		}

		return { success: true };
	}
} satisfies Actions;
