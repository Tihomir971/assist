import type { SupabaseClient } from '@supabase/supabase-js';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { CategoryService } from '$lib/services/supabase/category.service';
import { ChannelMappingCategoryService } from '$lib/services/supabase/channel-mapping-category.service';
import { ChannelService } from '$lib/services/supabase/channel.service';
import { createSimpleCRUD } from '$lib/utils/simple-crud.factory';
import { categoryPayloadBuilder } from './category.payload';
import { channelMappingPayloadBuilder } from './channel-mapping.payload';

import {
	cChannelMapCategoryInsertSchema,
	mProductCategoryInsertSchema,
	type Database
} from '@tihomir971/assist-shared';
import type { CChannelMapCategoryRow, MProductCategoryRow } from '@tihomir971/assist-shared';

export const load: PageServerLoad = async ({ params, locals, depends }) => {
	depends('app:category-page');

	const categoryService = new CategoryService(locals.supabase);
	const channelService = new ChannelService(locals.supabase);

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
			channelService.getChannelLookup()
			// localeService.getLocales()
		]);

		if (categoryId && !categoryWithRelated?.category) {
			throw error(404, 'Category not found');
		}

		// Ensure multilingual JSONB fields are initialized for new entities so components
		// that bind to nested locales never receive `null`/`undefined`.
		const initialCategory = categoryWithRelated?.category ?? {
			created_at: undefined,
			description: undefined,
			descriptions: {},
			id: undefined,
			is_active: false,
			is_self_service: false,
			name: '',
			names: {},
			parent_id: null,
			updated_at: undefined
		};

		return {
			// Provide a fully-initialized form object to superValidate so multilingual fields are objects
			formCategory: await superValidate(initialCategory, zod4(mProductCategoryInsertSchema)),
			formChannel: await superValidate(null, zod4(cChannelMapCategoryInsertSchema)),
			category: categoryWithRelated?.category || null,
			channelMapCategory: categoryWithRelated?.channelMappings || [],
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
	(supabase: SupabaseClient<Database>) => new ChannelMappingCategoryService(supabase),
	channelMappingPayloadBuilder,
	cChannelMapCategoryInsertSchema
);

export const actions = {
	categoryUpsert: categoryActions.upsert,
	categoryDelete: categoryActions.delete,
	channelMapUpsert: channelMappingActions.upsert,
	channelMapDelete: channelMappingActions.delete
} satisfies Actions;
