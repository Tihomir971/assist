import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@tihomir971/assist-shared';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	cChannelMapCategoryInsertSchema,
	mProductCategoryInsertSchema
} from '@tihomir971/assist-shared';
// deleteByIdSchema is imported by the factory itself.
import { CategoryService } from '$lib/services/supabase/category.service';
import { ChannelMappingService } from '$lib/services/supabase/channel-mapping.service';
import { createSimpleCRUD } from '$lib/utils/simple-crud.factory';
import { categoryPayloadBuilder } from './category.payload';
import { channelMappingPayloadBuilder } from './channel-mapping.payload'; // Updated import
// All builders for this route are now co-located.
// The import from '$lib/utils/payload-configs.simplified' will be empty for these if no other builders remain.
import type { CChannelMapCategoryRow, MProductCategoryRow } from '@tihomir971/assist-shared';

// Load function remains the same (already optimized)
export const load: PageServerLoad = async ({ params, locals: { supabase }, depends }) => {
	depends('app:category-page');
	console.log("depends('app:category-page');");

	const categoryService = new CategoryService(supabase);
	const channelMappingService = new ChannelMappingService(supabase); // Instantiate ChannelMappingService

	let categoryId: number | null = null;

	if (params.id) {
		categoryId = parseInt(params.id);
		if (isNaN(categoryId)) {
			throw error(400, 'Invalid Category ID');
		}
	}

	try {
		const [categoryWithRelated, lookupCategories, lookupChannels] = await Promise.all([
			categoryId ? categoryService.getCategoryWithRelatedData(categoryId) : Promise.resolve(null),
			categoryService.getLookup(),
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
			formChannel: await superValidate(null, zod(cChannelMapCategoryInsertSchema)),

			// Data
			category: categoryWithRelated?.category || null,
			channelMapCategory: categoryWithRelated?.channelMappings || [],

			// Lookup data
			categories: lookupCategories,
			c_channels: lookupChannels
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
const categoryActions = createSimpleCRUD<MProductCategoryRow, typeof mProductCategoryInsertSchema>(
	'Category',
	(supabase: SupabaseClient<Database>) => new CategoryService(supabase),
	categoryPayloadBuilder,
	mProductCategoryInsertSchema,
	'/catalog'
);

const channelMappingActions = createSimpleCRUD<
	CChannelMapCategoryRow,
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
	channelMapUpsert: channelMappingActions.upsert,
	channelMapDelete: channelMappingActions.delete
} satisfies Actions;
