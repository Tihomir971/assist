import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Tables } from '$lib/types/supabase.types';
// src/routes/(app)/catalog/category/[[id]]/+page.server.ts (Refactored)
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	cChannelMapCategoryInsertSchema,
	mProductCategoryInsertSchema,
	priceRulesInsertSchema
} from '$lib/types/supabase.zod.schemas';
// deleteByIdSchema is imported by the factory itself.
import { CategoryService } from '$lib/services/supabase/category.service';
import { PriceRulesService } from '$lib/services/supabase/price-rules.service';
import { ChannelMappingService } from '$lib/services/supabase/channel-mapping.service';
import { createSimpleCRUD } from '$lib/utils/simple-crud.factory'; // New factory
import {
	categoryPayloadBuilder,
	priceRulesPayloadBuilder,
	channelMappingPayloadBuilder
} from '$lib/utils/payload-configs.simplified'; // New simplified configs

// Load function remains the same (already optimized)
export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
	const categoryService = new CategoryService(supabase);
	const priceRulesService = new PriceRulesService(supabase); // Instantiate PriceRulesService
	const channelMappingService = new ChannelMappingService(supabase); // Instantiate ChannelMappingService

	let categoryId: number | null = null;

	if (params.id) {
		categoryId = parseInt(params.id);
		if (isNaN(categoryId)) {
			throw error(400, 'Invalid Category ID');
		}
	}

	try {
		const [categoryWithRelated, lookupCategories, lookupPriceFormulas, lookupChannels] =
			await Promise.all([
				categoryId ? categoryService.getCategoryWithRelatedData(categoryId) : Promise.resolve(null),
				categoryService.getCategoryLookup(),
				priceRulesService.getPriceFormulasLookup(),
				channelMappingService.getChannelLookup()
			]);

		if (categoryId && !categoryWithRelated?.category) {
			throw error(404, 'Category not found');
		}

		return {
			// Form validation objects
			formCategory: await superValidate(
				categoryWithRelated?.category,
				zod(mProductCategoryInsertSchema)
			),
			formPriceRules: await superValidate(null, zod(priceRulesInsertSchema)),
			formChannel: await superValidate(null, zod(cChannelMapCategoryInsertSchema)),

			// Data
			category: categoryWithRelated?.category || null,
			priceRules: categoryWithRelated?.priceRules || [],
			channelMapCategory: categoryWithRelated?.channelMappings || [],

			// Lookup data
			categories: lookupCategories,
			priceFormulas: lookupPriceFormulas,
			channels: lookupChannels
		};
	} catch (err: unknown) {
		console.error('Error loading category data:', err);
		if (err instanceof Error && (err.message.includes('400') || err.message.includes('404'))) {
			throw error(parseInt(err.message.substring(0, 3)), err.message.substring(4));
		}
		throw error(
			500,
			(err instanceof Error ? err.message : String(err)) || 'Failed to load category data'
		);
	}
};

// Action factories using the new createSimpleCRUD and imported builders
const categoryActions = createSimpleCRUD<
	Tables<'m_product_category'>,
	typeof mProductCategoryInsertSchema
>(
	'Category',
	(supabase: SupabaseClient<Database>) => new CategoryService(supabase),
	categoryPayloadBuilder,
	mProductCategoryInsertSchema,
	'/catalog/category'
);

const priceRulesActions = createSimpleCRUD<Tables<'price_rules'>, typeof priceRulesInsertSchema>(
	'Price Rule',
	(supabase: SupabaseClient<Database>) => new PriceRulesService(supabase),
	priceRulesPayloadBuilder,
	priceRulesInsertSchema
);

const channelMappingActions = createSimpleCRUD<
	Tables<'c_channel_map_category'>,
	typeof cChannelMapCategoryInsertSchema
>(
	'Channel Mapping',
	(supabase: SupabaseClient<Database>) => new ChannelMappingService(supabase),
	channelMappingPayloadBuilder,
	cChannelMapCategoryInsertSchema
);

export const actions = {
	categoryUpsert: categoryActions.upsert,
	categoryDelete: categoryActions.delete,
	priceRulesUpsert: priceRulesActions.upsert,
	priceRulesDelete: priceRulesActions.delete,
	channelMapUpsert: channelMappingActions.upsert,
	channelMapDelete: channelMappingActions.delete
} satisfies Actions;
