import type { Database, Tables } from '$lib/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CRUDService } from '../base/crud.service';

export type Replenish = Tables<'m_replenish'>;
export type ReplenishCreate = Omit<Replenish, 'id' | 'created_at' | 'updated_at'>;
export type ReplenishUpdate = Partial<ReplenishCreate>;

export class ReplenishService implements CRUDService<Replenish, ReplenishCreate, ReplenishUpdate> {
	constructor(private supabase: SupabaseClient<Database>) {}

	async getById(id: number): Promise<Replenish | null> {
		const { data, error } = await this.supabase
			.from('m_replenish')
			.select('*')
			.eq('id', id)
			.maybeSingle();

		if (error) throw new Error(`Failed to fetch Replenish: ${error.message}`);
		return data;
	}

	async create(data: ReplenishCreate): Promise<Replenish> {
		const { data: newRecord, error } = await this.supabase
			.from('m_replenish')
			.insert(data)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to create Replenish: ${error.message}`);
		if (!newRecord) throw new Error('Failed to create Replenish: No data returned');
		return newRecord;
	}

	async update(id: number, data: ReplenishUpdate): Promise<Replenish> {
		const { data: updatedRecord, error } = await this.supabase
			.from('m_replenish')
			.update(data)
			.eq('id', id)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to update Replenish: ${error.message}`);
		if (!updatedRecord) throw new Error('Failed to update Replenish: No data returned');
		return updatedRecord;
	}

	async delete(id: number): Promise<void> {
		const { error } = await this.supabase.from('m_replenish').delete().eq('id', id);
		if (error) throw new Error(`Failed to delete Replenish: ${error.message}`);
	}

	async list(filters?: { m_product_id: number }): Promise<Replenish[]> {
		let query = this.supabase.from('m_replenish').select('*');

		if (filters?.m_product_id) {
			query = query.eq('m_product_id', filters.m_product_id);
		}

		const { data, error } = await query.order('m_warehouse_id');
		if (error) throw new Error(`Failed to list Replenish: ${error.message}`);
		return data || [];
	}
}
