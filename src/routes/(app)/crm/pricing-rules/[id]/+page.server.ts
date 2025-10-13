import type { PageServerLoad, Actions } from './$types';

import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { error } from '@sveltejs/kit';
import {
	PricingRulesService,
	PartnerService,
	AttributeService,
	BrandService
} from '$lib/services/supabase';
import type { PricingRule, PricingRuleCreate } from '$lib/types/pricing-rules.types';
import { formSchema } from './schema';
import { getCategoryTree } from '$lib/services/supabase/category.service.remote';

// Create a specific schema for the form that uses the detailed condition/formula schemas

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
	const pricingRulesService = new PricingRulesService(supabase);

	let rule: PricingRule | null = null;
	let isCreateMode = true;

	if (params.id && params.id !== 'create') {
		const ruleId = parseInt(params.id);
		if (isNaN(ruleId)) {
			throw error(400, 'Invalid rule ID');
		}

		rule = await pricingRulesService.getById(ruleId);
		if (!rule) {
			throw error(404, 'Pricing rule not found');
		}
		isCreateMode = false;
	}

	// Convert rule to format compatible with the new form schema
	const formData = rule
		? {
				id: rule.id,
				name: rule.name,
				formula: rule.formula,
				conditions: rule.conditions || {},
				priority: rule.priority,
				is_active: rule.is_active,
				target_group: rule.target_group,
				starts_at: rule.starts_at ? rule.starts_at.slice(0, 10) : null,
				ends_at: rule.ends_at ? rule.ends_at.slice(0, 10) : null
			}
		: {
				name: '',
				formula: { type: 'percentage_markup' as const, value: 20 },
				conditions: {},
				priority: 0,
				is_active: true,
				target_group: null,
				starts_at: null,
				ends_at: null
			};

	const [partners, categories, attributes, brands] = await Promise.all([
		new PartnerService(supabase).getLookup(),
		getCategoryTree(),
		new AttributeService(supabase).getLookup(),
		new BrandService(supabase).getLookup()
	]);

	return {
		rule,
		isCreateMode,
		formPricingRule: await superValidate(formData, zod4(formSchema)),
		lookupData: {
			partners,
			categories,
			attributes,
			brands
		}
	};
};

// Simple CRUD actions without factory for now due to type compatibility issues
export const actions: Actions = {
	upsert: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod4(formSchema));

		if (!form.valid) {
			return { form };
		}

		try {
			const service = new PricingRulesService(supabase);

			// Reconstruct the data object to match the service layer types
			const ruleData: PricingRuleCreate = {
				name: form.data.name,
				conditions: form.data.conditions || {},
				formula: form.data.formula || { type: 'percentage_markup', value: 20 },
				priority: form.data.priority || 0,
				is_active: form.data.is_active ?? true,
				target_group: form.data.target_group || undefined,
				starts_at: form.data.starts_at
					? new Date(form.data.starts_at + 'T00:00:00').toISOString()
					: undefined,
				ends_at: form.data.ends_at
					? new Date(form.data.ends_at + 'T23:59:59').toISOString()
					: undefined
			};

			let result;
			if (form.data.id) {
				// Update existing
				result = await service.update(form.data.id, ruleData);
			} else {
				// Create new
				result = await service.create(ruleData);
			}

			return { form, success: true, data: result };
		} catch (err) {
			const error = err as Error;
			console.error('Error saving pricing rule:', error.message, error.stack);
			return { form, error: `Save failed: ${error.message}` };
		}
	},

	delete: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		if (!id || isNaN(Number(id))) {
			return { error: 'Invalid ID' };
		}

		try {
			const service = new PricingRulesService(supabase);
			await service.delete(Number(id));

			return { success: true };
		} catch (error) {
			console.error('Error deleting pricing rule:', error);
			return { error: 'Failed to delete pricing rule' };
		}
	}
};
