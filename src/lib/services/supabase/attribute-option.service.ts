import type { Database, Tables } from '$lib/types/supabase.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CRUDService } from '../base/crud.service';

export type AttributeOption = Tables<'m_attribute_option'>;
export type AttributeOptionCreate = Omit<AttributeOption, 'id' | 'created_at' | 'updated_at'>;
export type AttributeOptionUpdate = Partial<AttributeOptionCreate>;
export type AttributeOptionLookup = { value: number; label: string };

export class AttributeOptionService
	implements CRUDService<AttributeOption, AttributeOptionCreate, AttributeOptionUpdate>
{
	constructor(private supabase: SupabaseClient<Database>) {}

	async getById(id: number): Promise<AttributeOption | null> {
		const { data, error } = await this.supabase
			.from('m_attribute_option')
			.select('*')
			.eq('id', id)
			.maybeSingle();

		if (error) throw new Error(`Failed to fetch attribute option: ${error.message}`);
		return data;
	}

	async create(data: AttributeOptionCreate): Promise<AttributeOption> {
		const { data: newAttributeOption, error } = await this.supabase
			.from('m_attribute_option')
			.insert(data)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to create attribute option: ${error.message}`);
		if (!newAttributeOption) throw new Error('Failed to create attribute option: No data returned');
		return newAttributeOption;
	}

	async update(id: number, data: AttributeOptionUpdate): Promise<AttributeOption> {
		const { data: updatedAttributeOption, error } = await this.supabase
			.from('m_attribute_option')
			.update(data)
			.eq('id', id)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to update attribute option: ${error.message}`);
		if (!updatedAttributeOption)
			throw new Error('Failed to update attribute option: No data returned');
		return updatedAttributeOption;
	}

	async delete(id: number): Promise<void> {
		const { error } = await this.supabase.from('m_attribute_option').delete().eq('id', id);
		if (error) throw new Error(`Failed to delete attribute option: ${error.message}`);
	}

	async list(filters?: Record<string, unknown>): Promise<AttributeOption[]> {
		let query = this.supabase.from('m_attribute_option').select('*');

		if (filters?.is_active !== undefined) {
			query = query.eq('is_active', filters.is_active as boolean);
		}
		if (filters?.attribute_id !== undefined) {
			query = query.eq('attribute_id', filters.attribute_id as number);
		}

		const { data, error } = await query.order('sort_order').order('name');
		if (error) throw new Error(`Failed to list attribute options: ${error.message}`);
		return data || [];
	}

	async getLookup(): Promise<AttributeOptionLookup[]> {
		const { data, error } = await this.supabase
			.from('m_attribute_option')
			.select('value:id, label:name')
			.eq('is_active', true)
			.order('sort_order')
			.order('name');

		if (error) throw new Error(`Failed to load attribute option lookup: ${error.message}`);
		return data || [];
	}

	async getByAttributeId(attributeId: number): Promise<AttributeOption[]> {
		const { data, error } = await this.supabase
			.from('m_attribute_option')
			.select('*')
			.eq('attribute_id', attributeId)
			.eq('is_active', true)
			.order('sort_order')
			.order('name');
		if (error)
			throw new Error(
				`Failed to fetch attribute options for attribute ID ${attributeId}: ${error.message}`
			);
		return data || [];
	}
}
