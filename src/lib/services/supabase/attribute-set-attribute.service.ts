import type { Database, Tables } from '$lib/types/supabase.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CRUDService } from '../base/crud.service';

export type AttributeSetAttribute = Tables<'m_attributeset_attribute'>;
export type AttributeSetAttributeCreate = Omit<
	AttributeSetAttribute,
	'id' | 'created_at' | 'updated_at'
>;
export type AttributeSetAttributeUpdate = Partial<AttributeSetAttributeCreate>;

export class AttributeSetAttributeService
	implements
		CRUDService<AttributeSetAttribute, AttributeSetAttributeCreate, AttributeSetAttributeUpdate>
{
	constructor(private supabase: SupabaseClient<Database>) {}

	async getById(id: number): Promise<AttributeSetAttribute | null> {
		const { data, error } = await this.supabase
			.from('m_attributeset_attribute')
			.select('*')
			.eq('id', id)
			.maybeSingle();

		if (error) throw new Error(`Failed to fetch attribute set attribute: ${error.message}`);
		return data;
	}

	async create(data: AttributeSetAttributeCreate): Promise<AttributeSetAttribute> {
		const { data: newAttributeSetAttribute, error } = await this.supabase
			.from('m_attributeset_attribute')
			.insert(data)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to create attribute set attribute: ${error.message}`);
		if (!newAttributeSetAttribute)
			throw new Error('Failed to create attribute set attribute: No data returned');
		return newAttributeSetAttribute;
	}

	async update(id: number, data: AttributeSetAttributeUpdate): Promise<AttributeSetAttribute> {
		const { data: updatedAttributeSetAttribute, error } = await this.supabase
			.from('m_attributeset_attribute')
			.update(data)
			.eq('id', id)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to update attribute set attribute: ${error.message}`);
		if (!updatedAttributeSetAttribute)
			throw new Error('Failed to update attribute set attribute: No data returned');
		return updatedAttributeSetAttribute;
	}

	async delete(id: number): Promise<void> {
		const { error } = await this.supabase.from('m_attributeset_attribute').delete().eq('id', id);
		if (error) throw new Error(`Failed to delete attribute set attribute: ${error.message}`);
	}

	async list(filters?: Record<string, unknown>): Promise<AttributeSetAttribute[]> {
		let query = this.supabase.from('m_attributeset_attribute').select('*');

		if (filters?.attributeset_id !== undefined) {
			query = query.eq('attributeset_id', filters.attributeset_id as number);
		}

		if (filters?.is_active !== undefined) {
			query = query.eq('is_active', filters.is_active as boolean);
		}

		const { data, error } = await query.order('sequence');
		if (error) throw new Error(`Failed to list attribute set attributes: ${error.message}`);
		return data || [];
	}

	async getByAttributeSetId(attributeSetId: number): Promise<AttributeSetAttribute[]> {
		const { data, error } = await this.supabase
			.from('m_attributeset_attribute')
			.select('*, m_attribute(*)')
			.eq('attributeset_id', attributeSetId)
			.order('sequence');

		if (error) throw new Error(`Failed to fetch attribute set attributes: ${error.message}`);
		return data || [];
	}
}
