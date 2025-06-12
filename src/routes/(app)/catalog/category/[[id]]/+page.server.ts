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
import { PayloadBuilder } from '$lib/utils/form-payload.utils';
import { createCRUDActionFactory } from '$lib/utils/crud-actions.factory';
import {
	categoryPayloadConfig,
	priceRulesPayloadConfig,
	channelMappingPayloadConfig
} from '$lib/utils/payload-configs';

// Load function remains the same (already optimized)
export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
	const categoryService = new CategoryService(supabase);

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
				supabase
					.from('m_product_category')
					.select('value:id, label:name')
					.order('name')
					.then(({ data, error: err }) => {
						if (err) throw new Error(`Failed to load categories: ${err.message}`);
						return data || [];
					}),
				supabase
					.from('price_formulas')
					.select('value:id, label:name')
					.order('name')
					.then(({ data, error: err }) => {
						if (err) throw new Error(`Failed to load price formulas: ${err.message}`);
						return data || [];
					}),
				supabase
					.from('c_channel')
					.select('label:name, value:id')
					.then(({ data, error: err }) => {
						if (err) throw new Error(`Failed to load channels: ${err.message}`);
						return data || [];
					})
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

// Create payload builders
const categoryPayloadBuilder = new PayloadBuilder(categoryPayloadConfig);
const priceRulesPayloadBuilder = new PayloadBuilder(priceRulesPayloadConfig);
const channelMappingPayloadBuilder = new PayloadBuilder(channelMappingPayloadConfig);

// Create action factories
const categoryActions = createCRUDActionFactory((supabase) => new CategoryService(supabase), {
	payloadBuilder: categoryPayloadBuilder,
	entityName: 'Category',
	insertSchema: mProductCategoryInsertSchema,
	redirectOnDelete: '/catalog/category'
});

const priceRulesActions = createCRUDActionFactory((supabase) => new PriceRulesService(supabase), {
	payloadBuilder: priceRulesPayloadBuilder,
	entityName: 'Price Rule',
	insertSchema: priceRulesInsertSchema
});

const channelMappingActions = createCRUDActionFactory(
	(supabase) => new ChannelMappingService(supabase),
	{
		payloadBuilder: channelMappingPayloadBuilder,
		entityName: 'Channel Mapping',
		insertSchema: cChannelMapCategoryInsertSchema
	}
);

export const actions = {
	categoryUpsert: categoryActions.upsert,
	categoryDelete: categoryActions.delete,
	priceRulesUpsert: priceRulesActions.upsert,
	priceRulesDelete: priceRulesActions.delete,
	channelMapUpsert: channelMappingActions.upsert,
	channelMapDelete: channelMappingActions.delete
} satisfies Actions;
