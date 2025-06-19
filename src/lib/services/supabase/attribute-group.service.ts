import type { Database, Tables } from '$lib/types/supabase.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CRUDService } from '../base/crud.service';

export type AttributeGroup = Tables<'m_attribute_group'>;
export type AttributeGroupCreate = Omit<AttributeGroup, 'id' | 'created_at' | 'updated_at'>;
export type AttributeGroupUpdate = Partial<AttributeGroupCreate>;
export type AttributeGroupLookup = { value: number; label: string };

export class AttributeGroupService
	implements CRUDService<AttributeGroup, AttributeGroupCreate, AttributeGroupUpdate>
{
	constructor(private supabase: SupabaseClient<Database>) {}

	async getById(id: number): Promise<AttributeGroup | null> {
		const { data, error } = await this.supabase
			.from('m_attribute_group')
			.select('*')
			.eq('id', id)
			.maybeSingle();

		if (error) throw new Error(`Failed to fetch attribute group: ${error.message}`);
		return data;
	}

	async create(data: AttributeGroupCreate): Promise<AttributeGroup> {
		const { data: newAttributeGroup, error } = await this.supabase
			.from('m_attribute_group')
			.insert(data)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to create attribute group: ${error.message}`);
		if (!newAttributeGroup) throw new Error('Failed to create attribute group: No data returned');
		return newAttributeGroup;
	}

	async update(id: number, data: AttributeGroupUpdate): Promise<AttributeGroup> {
		const { data: updatedAttributeGroup, error } = await this.supabase
			.from('m_attribute_group')
			.update(data)
			.eq('id', id)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to update attribute group: ${error.message}`);
		if (!updatedAttributeGroup)
			throw new Error('Failed to update attribute group: No data returned');
		return updatedAttributeGroup;
	}

	async delete(id: number): Promise<void> {
		const { error } = await this.supabase.from('m_attribute_group').delete().eq('id', id);
		if (error) throw new Error(`Failed to delete attribute group: ${error.message}`);
	}

	async list(filters?: Record<string, unknown>): Promise<AttributeGroup[]> {
		let query = this.supabase.from('m_attribute_group').select('*');

		if (filters?.is_active !== undefined) {
			query = query.eq('is_active', filters.is_active as boolean);
		}

		const { data, error } = await query.order('name');
		if (error) throw new Error(`Failed to list attribute groups: ${error.message}`);
		return data || [];
	}

	async getLookup(): Promise<AttributeGroupLookup[]> {
		const { data, error } = await this.supabase
			.from('m_attribute_group')
			.select('value:id, label:name')
			.eq('is_active', true)
			.order('name');

		if (error) throw new Error(`Failed to load attribute group lookup: ${error.message}`);
		return data || [];
	}
}
