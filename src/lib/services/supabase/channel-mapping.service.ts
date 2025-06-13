import type { Database, Tables } from '$lib/types/supabase.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CRUDService } from '../base/crud.service';

export type ChannelMapping = Tables<'c_channel_map_category'>; // Exported
export type ChannelMappingCreate = Omit<ChannelMapping, 'id' | 'created_at' | 'updated_at'>; // Exported
export type ChannelMappingUpdate = Partial<ChannelMappingCreate>; // Exported
export type ChannelLookup = { value: number; label: string }; // Exported for lookup

export class ChannelMappingService
	implements CRUDService<ChannelMapping, ChannelMappingCreate, ChannelMappingUpdate>
{
	constructor(private supabase: SupabaseClient<Database>) {}

	async getById(id: number): Promise<ChannelMapping | null> {
		const { data, error } = await this.supabase
			.from('c_channel_map_category')
			.select('*')
			.eq('id', id)
			.maybeSingle();

		if (error) throw new Error(`Failed to fetch channel mapping: ${error.message}`);
		return data;
	}

	async create(data: ChannelMappingCreate): Promise<ChannelMapping> {
		const { data: newMapping, error } = await this.supabase
			.from('c_channel_map_category')
			.insert(data)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to create channel mapping: ${error.message}`);
		if (!newMapping) throw new Error('Failed to create channel mapping: No data returned');
		return newMapping;
	}

	async update(id: number, data: ChannelMappingUpdate): Promise<ChannelMapping> {
		const { data: updatedMapping, error } = await this.supabase
			.from('c_channel_map_category')
			.update(data)
			.eq('id', id)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to update channel mapping: ${error.message}`);
		if (!updatedMapping) throw new Error('Failed to update channel mapping: No data returned');
		return updatedMapping;
	}

	async delete(id: number): Promise<void> {
		const { error } = await this.supabase.from('c_channel_map_category').delete().eq('id', id);

		if (error) throw new Error(`Failed to delete channel mapping: ${error.message}`);
	}

	async list(filters?: Record<string, unknown>): Promise<ChannelMapping[]> {
		let query = this.supabase.from('c_channel_map_category').select('*');

		if (filters?.m_product_category_id) {
			query = query.eq('m_product_category_id', filters.m_product_category_id as number);
		}

		const { data, error } = await query.order('resource_name'); // Assuming 'resource_name' exists for ordering
		if (error) throw new Error(`Failed to list channel mappings: ${error.message}`);
		return data || [];
	}

	async getChannelLookup(): Promise<ChannelLookup[]> {
		const { data, error } = await this.supabase.from('c_channel').select('label:name, value:id'); // No specific order mentioned, can add if needed

		if (error) throw new Error(`Failed to load channel lookup: ${error.message}`);
		return data || [];
	}
}
