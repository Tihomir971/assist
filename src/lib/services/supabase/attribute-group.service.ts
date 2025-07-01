import type { Database, Tables } from '$lib/types/supabase.types';
import type { SupabaseClient } from '@supabase/supabase-js';

export type AttributeGroup = Tables<'m_attribute_group'>;
export type AttributeGroupCreate = Omit<AttributeGroup, 'id' | 'created_at' | 'updated_at'>;
export type AttributeGroupUpdate = Partial<AttributeGroupCreate>;
export type AttributeGroupLookup = { value: number; label: string };

export class AttributeGroupService {
	constructor(private supabase: SupabaseClient<Database>) {}

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
