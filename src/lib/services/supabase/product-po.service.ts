import type { Database, Tables } from '$lib/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CRUDService } from '../base/crud.service';

export type ProductPo = Tables<'m_product_po'>;
export type ProductPoCreate = Omit<ProductPo, 'id' | 'created_at' | 'updated_at'>;
export type ProductPoUpdate = Partial<ProductPoCreate>;

export class ProductPoService implements CRUDService<ProductPo, ProductPoCreate, ProductPoUpdate> {
	constructor(private supabase: SupabaseClient<Database>) {}

	async getById(id: number): Promise<ProductPo | null> {
		const { data, error } = await this.supabase
			.from('m_product_po')
			.select('*')
			.eq('id', id)
			.maybeSingle();

		if (error) throw new Error(`Failed to fetch ProductPo: ${error.message}`);
		return data;
	}

	async create(data: ProductPoCreate): Promise<ProductPo> {
		const { data: newRecord, error } = await this.supabase
			.from('m_product_po')
			.insert(data)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to create ProductPo: ${error.message}`);
		if (!newRecord) throw new Error('Failed to create ProductPo: No data returned');
		return newRecord;
	}

	async update(id: number, data: ProductPoUpdate): Promise<ProductPo> {
		const { data: updatedRecord, error } = await this.supabase
			.from('m_product_po')
			.update(data)
			.eq('id', id)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to update ProductPo: ${error.message}`);
		if (!updatedRecord) throw new Error('Failed to update ProductPo: No data returned');
		return updatedRecord;
	}

	async delete(id: number): Promise<void> {
		const { error } = await this.supabase.from('m_product_po').delete().eq('id', id);
		if (error) throw new Error(`Failed to delete ProductPo: ${error.message}`);
	}

	async list(filters?: { m_product_id: number }): Promise<ProductPo[]> {
		let query = this.supabase.from('m_product_po').select('*');

		if (filters?.m_product_id) {
			query = query.eq('m_product_id', filters.m_product_id);
		}

		const { data, error } = await query.order('c_bpartner_id');
		if (error) throw new Error(`Failed to list ProductPo: ${error.message}`);
		return data || [];
	}
}
