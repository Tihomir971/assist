import type { Database, Tables } from '$lib/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CRUDService } from '../base/crud.service';

export type ChannelMappingTaxCategory = Tables<'c_channel_map_taxcategory'>;
export type ChannelMappingTaxCategoryCreate = Omit<
	ChannelMappingTaxCategory,
	'id' | 'created_at' | 'updated_at'
>;
export type ChannelMappingTaxCategoryUpdate = Partial<ChannelMappingTaxCategoryCreate>;

export class ChannelMappingTaxCategoryService
	implements
		CRUDService<
			ChannelMappingTaxCategory,
			ChannelMappingTaxCategoryCreate,
			ChannelMappingTaxCategoryUpdate
		>
{
	constructor(private supabase: SupabaseClient<Database>) {}

	async getById(id: number): Promise<ChannelMappingTaxCategory | null> {
		const { data, error } = await this.supabase
			.from('c_channel_map_taxcategory')
			.select('*')
			.eq('id', id)
			.maybeSingle();

		if (error) throw new Error(`Failed to fetch tax category mapping: ${error.message}`);
		return data;
	}

	async create(data: ChannelMappingTaxCategoryCreate): Promise<ChannelMappingTaxCategory> {
		const { data: newMapping, error } = await this.supabase
			.from('c_channel_map_taxcategory')
			.insert(data)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to create tax category mapping: ${error.message}`);
		if (!newMapping) throw new Error('Failed to create tax category mapping: No data returned');
		return newMapping;
	}

	async update(
		id: number,
		data: ChannelMappingTaxCategoryUpdate
	): Promise<ChannelMappingTaxCategory> {
		const { data: updatedMapping, error } = await this.supabase
			.from('c_channel_map_taxcategory')
			.update(data)
			.eq('id', id)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to update tax category mapping: ${error.message}`);
		if (!updatedMapping) throw new Error('Failed to update tax category mapping: No data returned');
		return updatedMapping;
	}

	async delete(id: number): Promise<void> {
		const { error } = await this.supabase.from('c_channel_map_taxcategory').delete().eq('id', id);

		if (error) throw new Error(`Failed to delete tax category mapping: ${error.message}`);
	}

	async list(filters?: Record<string, unknown>): Promise<ChannelMappingTaxCategory[]> {
		let query = this.supabase.from('c_channel_map_taxcategory').select('*');

		if (filters?.c_taxcategory_id) {
			query = query.eq('c_taxcategory_id', filters.c_taxcategory_id as number);
		}

		const { data, error } = await query.order('resource_name');
		if (error) throw new Error(`Failed to list tax category mappings: ${error.message}`);
		return data || [];
	}

	async getByTaxCategory(taxCategoryId: number): Promise<ChannelMappingTaxCategory[]> {
		const { data, error } = await this.supabase
			.from('c_channel_map_taxcategory')
			.select(
				`
                *,
                c_channel:c_channel_id (id, name, code)
            `
			)
			.eq('c_taxcategory_id', taxCategoryId)
			.order('created_at', { ascending: false });

		if (error) throw new Error(`Failed to fetch tax category mappings: ${error.message}`);
		return data || [];
	}
}
