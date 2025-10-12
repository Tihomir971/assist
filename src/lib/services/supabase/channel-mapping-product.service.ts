import type { Database, Tables } from '$lib/types/supabase.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CRUDService } from '../base/crud.service';

export type ChannelMappingProduct = Tables<'c_channel_map_product'>;
export type ChannelMappingProductCreate = Omit<
	ChannelMappingProduct,
	'id' | 'created_at' | 'updated_at'
>;
export type ChannelMappingProductUpdate = Partial<ChannelMappingProductCreate>;

export class ChannelMappingProductService
	implements
		CRUDService<ChannelMappingProduct, ChannelMappingProductCreate, ChannelMappingProductUpdate>
{
	constructor(private supabase: SupabaseClient<Database>) {}

	async getById(id: number): Promise<ChannelMappingProduct | null> {
		const { data, error } = await this.supabase
			.from('c_channel_map_product')
			.select('*')
			.eq('id', id)
			.maybeSingle();

		if (error) throw new Error(`Failed to fetch product mapping: ${error.message}`);
		return data;
	}

	async create(data: ChannelMappingProductCreate): Promise<ChannelMappingProduct> {
		const { data: newMapping, error } = await this.supabase
			.from('c_channel_map_product')
			.insert(data)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to create product mapping: ${error.message}`);
		if (!newMapping) throw new Error('Failed to create product mapping: No data returned');
		return newMapping;
	}

	async update(id: number, data: ChannelMappingProductUpdate): Promise<ChannelMappingProduct> {
		const { data: updatedMapping, error } = await this.supabase
			.from('c_channel_map_product')
			.update(data)
			.eq('id', id)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to update product mapping: ${error.message}`);
		if (!updatedMapping) throw new Error('Failed to update product mapping: No data returned');
		return updatedMapping;
	}

	async delete(id: number): Promise<void> {
		const { error } = await this.supabase.from('c_channel_map_product').delete().eq('id', id);

		if (error) throw new Error(`Failed to delete product mapping: ${error.message}`);
	}

	async list(filters?: Record<string, unknown>): Promise<ChannelMappingProduct[]> {
		let query = this.supabase.from('c_channel_map_product').select('*');

		if (filters?.m_product_id) {
			query = query.eq('m_product_id', filters.m_product_id as number);
		}

		const { data, error } = await query.order('resource_name');
		if (error) throw new Error(`Failed to list product mappings: ${error.message}`);
		return data || [];
	}

	async getByProduct(productId: number): Promise<ChannelMappingProduct[]> {
		const { data, error } = await this.supabase
			.from('c_channel_map_product')
			.select(
				`
                *,
                c_channel:c_channel_id (id, name, code)
            `
			)
			.eq('m_product_id', productId)
			.order('created_at', { ascending: false });

		if (error) throw new Error(`Failed to fetch product mappings: ${error.message}`);
		return data || [];
	}
}
