import type { SupabaseClient } from '@supabase/supabase-js';
import type { CRUDService } from '../base/crud.service';
import type { Database, Tables } from '@tihomir971/assist-shared';

type ChannelMappingCategory = Tables<'c_channel_map_category'>;
type ChannelMappingCategoryCreate = Omit<
	ChannelMappingCategory,
	'id' | 'created_at' | 'updated_at'
>;
type ChannelMappingCategoryUpdate = Partial<ChannelMappingCategoryCreate>;

export class ChannelMappingCategoryService
	implements
		CRUDService<ChannelMappingCategory, ChannelMappingCategoryCreate, ChannelMappingCategoryUpdate>
{
	constructor(private supabase: SupabaseClient<Database>) {}

	async getById(id: number): Promise<ChannelMappingCategory | null> {
		const { data, error } = await this.supabase
			.from('c_channel_map_category')
			.select('*')
			.eq('id', id)
			.maybeSingle();

		if (error) throw new Error(`Failed to fetch channel mapping: ${error.message}`);
		return data;
	}

	async create(data: ChannelMappingCategoryCreate): Promise<ChannelMappingCategory> {
		const { data: newMapping, error } = await this.supabase
			.from('c_channel_map_category')
			.insert(data)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to create channel mapping: ${error.message}`);
		if (!newMapping) throw new Error('Failed to create channel mapping: No data returned');
		return newMapping;
	}

	async update(id: number, data: ChannelMappingCategoryUpdate): Promise<ChannelMappingCategory> {
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

	async list(filters?: Record<string, unknown>): Promise<ChannelMappingCategory[]> {
		let query = this.supabase.from('c_channel_map_category').select('*');

		if (filters?.m_product_category_id) {
			query = query.eq('m_product_category_id', filters.m_product_category_id as number);
		}

		const { data, error } = await query.order('resource_name');
		if (error) throw new Error(`Failed to list channel mappings: ${error.message}`);
		return data || [];
	}

	async getByCategory(categoryId: number): Promise<ChannelMappingCategory[]> {
		const { data, error } = await this.supabase
			.from('c_channel_map_category')
			.select(
				`
                *,
                c_channel:c_channel_id (id, name, code)
            `
			)
			.eq('m_product_category_id', categoryId)
			.order('created_at', { ascending: false });

		if (error) throw new Error(`Failed to fetch category mappings: ${error.message}`);
		return data || [];
	}
}
