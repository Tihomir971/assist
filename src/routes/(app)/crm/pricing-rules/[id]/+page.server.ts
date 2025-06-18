import type { PageServerLoad, Actions } from './$types';

import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error } from '@sveltejs/kit';
import {
	PricingRulesService,
	PartnerService,
	CategoryService,
	AttributeService
} from '$lib/services/supabase';
import { pricingRulesInsertSchema } from '$lib/types/supabase.zod.schemas';
import type { PricingRule } from '$lib/types/pricing-rules.types';

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

	// Convert rule to format compatible with Zod schema (exclude id for insert schema)
	const formData = rule
		? {
				name: rule.name,
				formula: JSON.stringify(rule.formula),
				conditions: JSON.stringify(rule.conditions || {}),
				priority: rule.priority,
				is_active: rule.is_active,
				target_group: rule.target_group,
				starts_at: rule.starts_at,
				ends_at: rule.ends_at,
				created_at: rule.created_at,
				updated_at: rule.updated_at
			}
		: {
				name: '',
				formula: '{"type": "markup_cost", "value": 1.2}',
				conditions: '{}',
				priority: 0,
				is_active: true,
				target_group: null,
				starts_at: null,
				ends_at: null
			};

	const [partners, categories, attributes] = await Promise.all([
		new PartnerService(supabase).getLookup(),
		new CategoryService(supabase).getLookup(),
		new AttributeService(supabase).getLookup()
	]);

	return {
		rule,
		isCreateMode,
		formPricingRule: await superValidate(formData, zod(pricingRulesInsertSchema)),
		lookupData: {
			partners,
			categories,
			attributes
		}
	};
};

// Simple CRUD actions without factory for now due to type compatibility issues
export const actions: Actions = {
	upsert: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(pricingRulesInsertSchema));

		if (!form.valid) {
			return { form };
		}

		try {
			const service = new PricingRulesService(supabase);

			// Convert form data to proper format
			const ruleData = {
				name: form.data.name,
				formula:
					typeof form.data.formula === 'string' ? JSON.parse(form.data.formula) : form.data.formula,
				conditions:
					typeof form.data.conditions === 'string'
						? JSON.parse(form.data.conditions || '{}')
						: form.data.conditions || {},
				priority: form.data.priority || 0,
				is_active: form.data.is_active ?? true,
				target_group: form.data.target_group || undefined,
				starts_at: form.data.starts_at || undefined,
				ends_at: form.data.ends_at || undefined
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
			console.error('Error saving pricing rule:', err);
			return { form, error: 'Failed to save pricing rule' };
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
