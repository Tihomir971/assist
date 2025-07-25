import type { PageServerLoad, Actions } from './$types';
import { PricingRulesService } from '$lib/services/supabase/pricing-rules.service';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import * as z from 'zod/v3';

// Simple delete schema
const deleteSchema = z.object({
	id: z.number()
});

// Simple create schema - only name required
const createSchema = z.object({
	name: z.string().min(1, 'Ime je obavezno')
});

// Schema for swapping priorities
const swapPrioritiesSchema = z.object({
	rule1Id: z.number(),
	rule2Id: z.number()
});

// Schema for cloning a rule
const cloneSchema = z.object({
	id: z.number()
});

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	try {
		const service = new PricingRulesService(supabase);
		const rulesFromDb = await service.list();

		const formulaLabels: Record<string, string> = {
			proportional_markup: 'Proporcionalna marža',
			fixed_price: 'Fiksna cijena',
			discount: 'Popust (%)',
			percentage_markup: 'Procentna marža',
			custom_script: 'Prilagođena skripta'
		};

		const rules = rulesFromDb.map((rule) => {
			const conditions = rule.conditions || {};
			const formula = rule.formula || null;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const formulaType = (formula as any)?.type;
			const formulaLabel = formulaType ? formulaLabels[formulaType] || formulaType : '';

			return {
				...rule,
				partnerCount: conditions.partner_ids?.length || 0,
				categoryCount: conditions.category_ids?.length || 0,
				brandCount: conditions.brand_ids?.length || 0,
				attributeCount: conditions.attributes?.length || 0,
				formula,
				formulaLabel
			};
		});

		return {
			rules
		};
	} catch (error) {
		console.error('Error loading pricing rules:', error);
		return {
			rules: []
		};
	}
};

export const actions: Actions = {
	create: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(createSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const service = new PricingRulesService(supabase);
			// Create with minimal data - default formula
			const newRule = await service.create({
				name: form.data.name,
				conditions: {},
				formula: { type: 'percentage_markup', value: 20 },
				priority: 0,
				is_active: true
			});

			return { success: true, ruleId: newRule.id };
		} catch (error) {
			console.error('Error creating pricing rule:', error);
			return fail(500, { error: 'Failed to create pricing rule' });
		}
	},

	delete: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(deleteSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const service = new PricingRulesService(supabase);
			await service.delete(form.data.id);

			return { success: true };
		} catch (error) {
			console.error('Error deleting pricing rule:', error);
			return fail(500, { error: 'Failed to delete pricing rule' });
		}
	},

	swapPriorities: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(swapPrioritiesSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { rule1Id, rule2Id } = form.data;

		try {
			const service = new PricingRulesService(supabase);

			const rule1 = await service.getById(rule1Id);
			const rule2 = await service.getById(rule2Id);

			if (!rule1 || !rule2) {
				return fail(404, { error: 'Jedno ili oba pravila nisu pronađena.' });
			}

			const priority1 = rule1.priority;
			const priority2 = rule2.priority;

			// Swap priorities
			// Wrapped in a transaction if Supabase JS client supports it easily,
			// otherwise, individual updates. For now, individual updates.
			// Consider potential race conditions if many users are changing priorities simultaneously,
			// though for typical use, this should be acceptable.
			await service.update(rule1Id, { priority: priority2 });
			await service.update(rule2Id, { priority: priority1 });

			return { success: true };
		} catch (error) {
			console.error('Error swapping priorities:', error);
			return fail(500, { error: 'Greška prilikom zamene prioriteta.' });
		}
	},

	clone: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod(cloneSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const service = new PricingRulesService(supabase);
			const newRule = await service.clone(form.data.id);

			return { success: true, newRuleId: newRule.id };
		} catch (error) {
			console.error('Error cloning pricing rule:', error);
			return fail(500, { error: 'Failed to clone pricing rule' });
		}
	}
};
