import type { PageServerLoad, Actions } from './$types';
import { PriceListService } from '$lib/services/supabase/pricelist.service';
import { createSimpleCRUD } from '$lib/utils/simple-crud.factory';
import type { SupabaseClient } from '@supabase/supabase-js';
import { mPricelistInsertSchema } from '@tihomir971/assist-shared';
import type { Database, MPricelistRow } from '@tihomir971/assist-shared';
import { pricelistPayloadBuilder } from './pricelist.payload';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const priceListService = new PriceListService(supabase);

	return {
		pricelists: await priceListService.list()
	};
};

// Action factories using the new createSimpleCRUD and imported builders
const pricelistActions = createSimpleCRUD<MPricelistRow, typeof mPricelistInsertSchema>(
	'Pricelist', // Corrected entity name
	(supabase: SupabaseClient<Database>) => new PriceListService(supabase),
	pricelistPayloadBuilder,
	mPricelistInsertSchema,
	'/catalog/price-lists' // Corrected redirect path
);

export const actions = {
	pricelistUpsert: pricelistActions.upsert,
	pricelistDelete: pricelistActions.delete
} satisfies Actions;
