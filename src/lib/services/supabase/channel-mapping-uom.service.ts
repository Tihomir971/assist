import type { Database, Tables } from '$lib/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CRUDService } from '../base/crud.service';

export type ChannelMappingUom = Tables<'c_channel_map_uom'>;
export type ChannelMappingUomCreate = Omit<ChannelMappingUom, 'id' | 'created_at' | 'updated_at'>;
export type ChannelMappingUomUpdate = Partial<ChannelMappingUomCreate>;

export class ChannelMappingUomService
	implements CRUDService<ChannelMappingUom, ChannelMappingUomCreate, ChannelMappingUomUpdate>
{
	constructor(private supabase: SupabaseClient<Database>) {}

	async getById(id: number): Promise<ChannelMappingUom | null> {
		const { data, error } = await this.supabase
			.from('c_channel_map_uom')
			.select('*')
			.eq('id', id)
			.maybeSingle();

		if (error) throw new Error(`Failed to fetch UOM mapping: ${error.message}`);
		return data;
	}

	async create(data: ChannelMappingUomCreate): Promise<ChannelMappingUom> {
		const { data: newMapping, error } = await this.supabase
			.from('c_channel_map_uom')
			.insert(data)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to create UOM mapping: ${error.message}`);
		if (!newMapping) throw new Error('Failed to create UOM mapping: No data returned');
		return newMapping;
	}

	async update(id: number, data: ChannelMappingUomUpdate): Promise<ChannelMappingUom> {
		const { data: updatedMapping, error } = await this.supabase
			.from('c_channel_map_uom')
			.update(data)
			.eq('id', id)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to update UOM mapping: ${error.message}`);
		if (!updatedMapping) throw new Error('Failed to update UOM mapping: No data returned');
		return updatedMapping;
	}

	async delete(id: number): Promise<void> {
		const { error } = await this.supabase.from('c_channel_map_uom').delete().eq('id', id);

		if (error) throw new Error(`Failed to delete UOM mapping: ${error.message}`);
	}

	async list(filters?: Record<string, unknown>): Promise<ChannelMappingUom[]> {
		let query = this.supabase.from('c_channel_map_uom').select('*');

		if (filters?.c_uom_id) {
			query = query.eq('c_uom_id', filters.c_uom_id as number);
		}

		const { data, error } = await query.order('resource_name');
		if (error) throw new Error(`Failed to list UOM mappings: ${error.message}`);
		return data || [];
	}

	async getByUom(uomId: number): Promise<ChannelMappingUom[]> {
		const { data, error } = await this.supabase
			.from('c_channel_map_uom')
			.select(
				`
                *,
                c_channel:c_channel_id (id, name, code)
            `
			)
			.eq('c_uom_id', uomId)
			.order('created_at', { ascending: false });

		if (error) throw new Error(`Failed to fetch UOM mappings: ${error.message}`);
		return data || [];
	}
}
