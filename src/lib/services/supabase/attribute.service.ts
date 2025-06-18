import type { Database, Tables } from '$lib/types/supabase.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CRUDService } from '../base/crud.service';
import type { AttributeOptionLookup } from './attribute-option.service'; // Assuming this will be created

export type Attribute = Tables<'m_attribute'>;
export type AttributeCreate = Omit<Attribute, 'id' | 'created_at' | 'updated_at'>;
export type AttributeUpdate = Partial<AttributeCreate>;
export type AttributeLookup = { value: number; label: string };

export class AttributeService implements CRUDService<Attribute, AttributeCreate, AttributeUpdate> {
	constructor(private supabase: SupabaseClient<Database>) {}

	async getById(id: number): Promise<Attribute | null> {
		const { data, error } = await this.supabase
			.from('m_attribute')
			.select('*')
			.eq('id', id)
			.maybeSingle();

		if (error) throw new Error(`Failed to fetch attribute: ${error.message}`);
		return data;
	}

	async create(data: AttributeCreate): Promise<Attribute> {
		const { data: newAttribute, error } = await this.supabase
			.from('m_attribute')
			.insert(data)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to create attribute: ${error.message}`);
		if (!newAttribute) throw new Error('Failed to create attribute: No data returned');
		return newAttribute;
	}

	async update(id: number, data: AttributeUpdate): Promise<Attribute> {
		const { data: updatedAttribute, error } = await this.supabase
			.from('m_attribute')
			.update(data)
			.eq('id', id)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to update attribute: ${error.message}`);
		if (!updatedAttribute) throw new Error('Failed to update attribute: No data returned');
		return updatedAttribute;
	}

	async delete(id: number): Promise<void> {
		const { error } = await this.supabase.from('m_attribute').delete().eq('id', id);
		if (error) throw new Error(`Failed to delete attribute: ${error.message}`);
	}

	async list(filters?: Record<string, unknown>): Promise<Attribute[]> {
		let query = this.supabase.from('m_attribute').select('*');

		if (filters?.is_active !== undefined) {
			query = query.eq('is_active', filters.is_active as boolean);
		}

		const { data, error } = await query.order('name');
		if (error) throw new Error(`Failed to list attributes: ${error.message}`);
		return data || [];
	}

	async getLookup(): Promise<AttributeLookup[]> {
		const { data, error } = await this.supabase
			.from('m_attribute')
			.select('value:id, label:name')
			.eq('is_active', true)
			.order('name');

		if (error) throw new Error(`Failed to load attribute lookup: ${error.message}`);
		return data || [];
	}

	async getAttributeOptions(attributeId: number): Promise<AttributeOptionLookup[]> {
		const { data, error } = await this.supabase
			.from('m_attribute_option')
			.select('value:id, label:name')
			.eq('attribute_id', attributeId)
			.eq('is_active', true)
			.order('sort_order') // Removed { nullsLast: true } as it caused an error
			.order('name');

		if (error)
			throw new Error(
				`Failed to load attribute options for attribute ${attributeId}: ${error.message}`
			);
		return data || [];
	}
}
