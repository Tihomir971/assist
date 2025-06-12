// src/routes/(app)/catalog/category/[[id]]/+page.server.ts
import { message, superValidate } from 'sveltekit-superforms';
import { zod, zod4 } from 'sveltekit-superforms/adapters';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import {
	cChannelMapCategoryInsertSchema,
	mProductCategoryInsertSchema,
	priceRulesInsertSchema
} from '$lib/types/supabase.zod.schemas';
import { deleteByIdSchema } from '$lib/types/zod-delete-by-id';
import { CategoryService } from '$lib/services/supabase/category.service';
import type { PriceRuleCreate, PriceRuleUpdate } from '$lib/services/supabase/price-rules.service';
import { PriceRulesService } from '$lib/services/supabase/price-rules.service';
import type {
	ChannelMappingCreate,
	ChannelMappingUpdate
} from '$lib/services/supabase/channel-mapping.service';
import { ChannelMappingService } from '$lib/services/supabase/channel-mapping.service';

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

export const actions = {
	categoryUpsert: async ({ request, locals: { supabase } }) => {
		const categoryService = new CategoryService(supabase);
		const formData = await request.formData();
		const form = await superValidate(formData, zod(mProductCategoryInsertSchema));

		if (!form.valid) return fail(400, { form });

		try {
			let result;
			const categoryData = { ...form.data };
			if (!categoryData.id || isNaN(Number(categoryData.id))) {
				delete categoryData.id;
			}

			if (!categoryData.id) {
				const { name, is_active, is_self_service, parent_id, description, ...otherData } =
					categoryData;

				const createPayload: import('$lib/services/supabase/category.service').CategoryCreate = {
					name: name,
					is_active: is_active ?? false,
					is_self_service: is_self_service ?? false,
					parent_id: parent_id === undefined ? null : parent_id,
					description: description === undefined ? null : description,
					...otherData
				};
				result = await categoryService.create(createPayload);
				form.data.id = result.id;
				return message(form, 'Category created successfully!');
			} else {
				const idToUpdate = Number(categoryData.id);
				if (isNaN(idToUpdate)) {
					throw new Error('Invalid ID for update operation.');
				}
				const { ...updateDataFields } = categoryData;

				const updatePayload: import('$lib/services/supabase/category.service').CategoryUpdate = {};

				if (updateDataFields.name !== undefined) updatePayload.name = updateDataFields.name;
				if (updateDataFields.is_active !== undefined)
					updatePayload.is_active = updateDataFields.is_active;
				else updatePayload.is_active = false;
				if (updateDataFields.is_self_service !== undefined)
					updatePayload.is_self_service = updateDataFields.is_self_service;
				else updatePayload.is_self_service = false;
				if (updateDataFields.parent_id !== undefined)
					updatePayload.parent_id = updateDataFields.parent_id;
				if (updateDataFields.description !== undefined)
					updatePayload.description = updateDataFields.description;

				result = await categoryService.update(idToUpdate, updatePayload);
				return message(form, 'Category updated successfully!');
			}
		} catch (err: unknown) {
			console.error('Category upsert error:', err);
			return message(
				form,
				{ type: 'error', text: err instanceof Error ? err.message : String(err) },
				{ status: 400 }
			);
		}
	},

	categoryDelete: async ({ request, locals: { supabase } }) => {
		const categoryService = new CategoryService(supabase);
		const formData = await request.formData();
		const form = await superValidate(formData, zod4(deleteByIdSchema));

		if (!form.valid) return fail(400, { form });

		try {
			await categoryService.delete(form.data.id);
			throw redirect(303, '/catalog/category');
		} catch (err: unknown) {
			if (typeof err === 'object' && err !== null && 'status' in err && err.status === 303)
				throw err;
			console.error('Category delete error:', err);
			return message(
				form,
				{ type: 'error', text: err instanceof Error ? err.message : String(err) },
				{ status: 500 }
			);
		}
	},

	priceRulesUpsert: async ({ request, locals: { supabase } }) => {
		const priceRulesService = new PriceRulesService(supabase);
		const form = await superValidate(request, zod(priceRulesInsertSchema));

		if (!form.valid) return fail(400, { form });

		try {
			const ruleData = { ...form.data };
			if (!ruleData.id || isNaN(Number(ruleData.id))) {
				delete ruleData.id;
			}

			if (!ruleData.id) {
				const {
					m_product_category_id,
					name,
					is_active,
					price_formula_id,
					m_product_id,
					m_attribute_id,
					priority,
					...otherRuleData
				} = ruleData;

				if (m_product_category_id === undefined || m_product_category_id === null) {
					throw new Error('Product category ID is required to create a price rule.');
				}
				if (price_formula_id === undefined || price_formula_id === null) {
					throw new Error('Price formula ID is required to create a price rule.');
				}

				const createPayload: PriceRuleCreate = {
					m_product_category_id,
					name: name === undefined ? null : name,
					is_active: is_active ?? false,
					price_formula_id,
					m_product_id: m_product_id === undefined ? null : m_product_id,
					m_attribute_id: m_attribute_id === undefined ? null : m_attribute_id,
					priority: priority === undefined ? 0 : priority,
					...otherRuleData
				};
				await priceRulesService.create(createPayload);
				return message(form, 'Price rule created successfully!');
			} else {
				const idToUpdate = Number(ruleData.id);
				if (isNaN(idToUpdate)) {
					throw new Error('Invalid ID for price rule update operation.');
				}
				const { ...updateDataFields } = ruleData;

				const updatePayload: PriceRuleUpdate = {};

				if (updateDataFields.name !== undefined) updatePayload.name = updateDataFields.name;
				if (updateDataFields.is_active !== undefined)
					updatePayload.is_active = updateDataFields.is_active;
				else updatePayload.is_active = false;
				if (updateDataFields.price_formula_id !== undefined)
					updatePayload.price_formula_id = updateDataFields.price_formula_id;
				if (updateDataFields.m_product_category_id !== undefined)
					updatePayload.m_product_category_id = updateDataFields.m_product_category_id;
				if (updateDataFields.m_product_id !== undefined)
					updatePayload.m_product_id = updateDataFields.m_product_id;
				if (updateDataFields.m_attribute_id !== undefined)
					updatePayload.m_attribute_id = updateDataFields.m_attribute_id;
				if (updateDataFields.priority !== undefined)
					updatePayload.priority = updateDataFields.priority;

				await priceRulesService.update(idToUpdate, updatePayload);
				return message(form, 'Price rule updated successfully!');
			}
		} catch (err: unknown) {
			console.error('Price rule upsert error:', err);
			return message(
				form,
				{ type: 'error', text: err instanceof Error ? err.message : String(err) },
				{ status: 400 }
			);
		}
	},

	priceRulesDelete: async ({ request, locals: { supabase } }) => {
		const priceRulesService = new PriceRulesService(supabase);
		const form = await superValidate(request, zod4(deleteByIdSchema));

		if (!form.valid) return fail(400, { form });

		try {
			await priceRulesService.delete(form.data.id);
			return message(form, 'Price rule deleted successfully!');
		} catch (err: unknown) {
			console.error('Price rule delete error:', err);
			return message(
				form,
				{ type: 'error', text: err instanceof Error ? err.message : String(err) },
				{ status: 500 }
			);
		}
	},

	channelMapUpsert: async ({ request, locals: { supabase } }) => {
		const channelMappingService = new ChannelMappingService(supabase);
		const form = await superValidate(request, zod(cChannelMapCategoryInsertSchema));

		if (!form.valid) return fail(400, { form });

		try {
			const mapData = { ...form.data };
			if (!mapData.id || isNaN(Number(mapData.id))) {
				delete mapData.id;
			}

			if (!mapData.id) {
				const {
					c_channel_id,
					resource_id,
					resource_name,
					is_active,
					m_product_category_id,
					...otherMapData
				} = mapData;

				if (c_channel_id === undefined || c_channel_id === null) {
					throw new Error('Channel ID is required to create a channel mapping.');
				}
				if (!resource_id) {
					throw new Error('Resource ID is required.');
				}
				if (!resource_name) {
					throw new Error('Resource Name is required.');
				}

				const createPayload: ChannelMappingCreate = {
					c_channel_id,
					resource_id,
					resource_name,
					is_active: is_active ?? false,
					m_product_category_id: m_product_category_id === undefined ? null : m_product_category_id,
					...otherMapData
				};
				await channelMappingService.create(createPayload);
				return message(form, 'Channel mapping created successfully!');
			} else {
				const idToUpdate = Number(mapData.id);
				if (isNaN(idToUpdate)) {
					throw new Error('Invalid ID for channel map update operation.');
				}
				const { ...updateDataFields } = mapData;

				const updatePayload: ChannelMappingUpdate = {};

				if (updateDataFields.c_channel_id !== undefined)
					updatePayload.c_channel_id = updateDataFields.c_channel_id;
				if (updateDataFields.resource_id !== undefined)
					updatePayload.resource_id = updateDataFields.resource_id;
				if (updateDataFields.resource_name !== undefined)
					updatePayload.resource_name = updateDataFields.resource_name;
				if (updateDataFields.is_active !== undefined)
					updatePayload.is_active = updateDataFields.is_active;
				else updatePayload.is_active = false;
				if (updateDataFields.m_product_category_id !== undefined)
					updatePayload.m_product_category_id = updateDataFields.m_product_category_id;

				await channelMappingService.update(idToUpdate, updatePayload);
				return message(form, 'Channel mapping updated successfully!');
			}
		} catch (err: unknown) {
			console.error('Channel mapping upsert error:', err);
			return message(
				form,
				{ type: 'error', text: err instanceof Error ? err.message : String(err) },
				{ status: 400 }
			);
		}
	},

	channelMapDelete: async ({ request, locals: { supabase } }) => {
		const channelMappingService = new ChannelMappingService(supabase);
		const form = await superValidate(request, zod4(deleteByIdSchema));

		if (!form.valid) return fail(400, { form });

		try {
			await channelMappingService.delete(form.data.id);
			return message(form, 'Channel mapping deleted successfully!');
		} catch (err: unknown) {
			console.error('Channel mapping delete error:', err);
			return message(
				form,
				{ type: 'error', text: err instanceof Error ? err.message : String(err) },
				{ status: 500 }
			);
		}
	}
} satisfies Actions;
