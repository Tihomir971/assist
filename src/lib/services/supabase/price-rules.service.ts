import type { Database, Tables } from '$lib/types/supabase.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CRUDService } from '../base/crud.service';

export type PriceRule = Tables<'price_rules'>; // Exported
export type PriceRuleCreate = Omit<PriceRule, 'id' | 'created_at' | 'updated_at'>; // Exported
export type PriceRuleUpdate = Partial<PriceRuleCreate>; // Exported

export class PriceRulesService implements CRUDService<PriceRule, PriceRuleCreate, PriceRuleUpdate> {
	constructor(private supabase: SupabaseClient<Database>) {}

	async getById(id: number): Promise<PriceRule | null> {
		const { data, error } = await this.supabase
			.from('price_rules')
			.select('*')
			.eq('id', id)
			.maybeSingle();

		if (error) throw new Error(`Failed to fetch price rule: ${error.message}`);
		return data;
	}

	async create(data: PriceRuleCreate): Promise<PriceRule> {
		const { data: newRule, error } = await this.supabase
			.from('price_rules')
			.insert(data)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to create price rule: ${error.message}`);
		if (!newRule) throw new Error('Failed to create price rule: No data returned');
		return newRule;
	}

	async update(id: number, data: PriceRuleUpdate): Promise<PriceRule> {
		const { data: updatedRule, error } = await this.supabase
			.from('price_rules')
			.update(data)
			.eq('id', id)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to update price rule: ${error.message}`);
		if (!updatedRule) throw new Error('Failed to update price rule: No data returned');
		return updatedRule;
	}

	async delete(id: number): Promise<void> {
		const { error } = await this.supabase.from('price_rules').delete().eq('id', id);

		if (error) throw new Error(`Failed to delete price rule: ${error.message}`);
	}

	async list(filters?: Record<string, unknown>): Promise<PriceRule[]> {
		let query = this.supabase.from('price_rules').select('*');

		if (filters?.m_product_category_id) {
			query = query.eq('m_product_category_id', filters.m_product_category_id as number);
		}

		const { data, error } = await query.order('name'); // Assuming 'name' exists for ordering
		if (error) throw new Error(`Failed to list price rules: ${error.message}`);
		return data || [];
	}
}
