import type { Database, Tables } from '$lib/types/supabase.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CRUDService } from '../base/crud.service';

export type ChannelMappingBrand = Tables<'c_channel_map_brand'>;
export type ChannelMappingBrandCreate = Omit<
	ChannelMappingBrand,
	'id' | 'created_at' | 'updated_at'
>;
export type ChannelMappingBrandUpdate = Partial<ChannelMappingBrandCreate>;

export class ChannelMappingBrandService
	implements CRUDService<ChannelMappingBrand, ChannelMappingBrandCreate, ChannelMappingBrandUpdate>
{
	constructor(private supabase: SupabaseClient<Database>) {}

	async getById(id: number): Promise<ChannelMappingBrand | null> {
		const { data, error } = await this.supabase
			.from('c_channel_map_brand')
			.select('*')
			.eq('id', id)
			.maybeSingle();

		if (error) throw new Error(`Failed to fetch brand mapping: ${error.message}`);
		return data;
	}

	async create(data: ChannelMappingBrandCreate): Promise<ChannelMappingBrand> {
		const { data: newMapping, error } = await this.supabase
			.from('c_channel_map_brand')
			.insert(data)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to create brand mapping: ${error.message}`);
		if (!newMapping) throw new Error('Failed to create brand mapping: No data returned');
		return newMapping;
	}

	async update(id: number, data: ChannelMappingBrandUpdate): Promise<ChannelMappingBrand> {
		const { data: updatedMapping, error } = await this.supabase
			.from('c_channel_map_brand')
			.update(data)
			.eq('id', id)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to update brand mapping: ${error.message}`);
		if (!updatedMapping) throw new Error('Failed to update brand mapping: No data returned');
		return updatedMapping;
	}

	async delete(id: number): Promise<void> {
		const { error } = await this.supabase.from('c_channel_map_brand').delete().eq('id', id);

		if (error) throw new Error(`Failed to delete brand mapping: ${error.message}`);
	}

	async list(filters?: Record<string, unknown>): Promise<ChannelMappingBrand[]> {
		let query = this.supabase.from('c_channel_map_brand').select('*');

		if (filters?.m_product_brands_id) {
			query = query.eq('m_product_brands_id', filters.m_product_brands_id as number);
		}

		const { data, error } = await query.order('resource_name');
		if (error) throw new Error(`Failed to list brand mappings: ${error.message}`);
		return data || [];
	}

	async getByBrand(brandId: number): Promise<ChannelMappingBrand[]> {
		const { data, error } = await this.supabase
			.from('c_channel_map_brand')
			.select(
				`
                *,
                c_channel:c_channel_id (id, name, code)
            `
			)
			.eq('m_product_brands_id', brandId)
			.order('created_at', { ascending: false });

		if (error) throw new Error(`Failed to fetch brand mappings: ${error.message}`);
		return data || [];
	}
}
