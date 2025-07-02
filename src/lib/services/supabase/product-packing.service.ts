import type { Database, Tables } from '@tihomir971/assist-shared';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CRUDService } from '../base/crud.service';

export type ProductPacking = Tables<'m_product_packing'>;
export type ProductPackingCreate = Omit<ProductPacking, 'id' | 'created_at' | 'updated_at'>;
export type ProductPackingUpdate = Partial<ProductPackingCreate>;

export class ProductPackingService
	implements CRUDService<ProductPacking, ProductPackingCreate, ProductPackingUpdate>
{
	constructor(private supabase: SupabaseClient<Database>) {}

	async getById(id: number): Promise<ProductPacking | null> {
		const { data, error } = await this.supabase
			.from('m_product_packing')
			.select('*')
			.eq('id', id)
			.maybeSingle();

		if (error) throw new Error(`Failed to fetch ProductPacking: ${error.message}`);
		return data;
	}

	async create(data: ProductPackingCreate): Promise<ProductPacking> {
		const { data: newRecord, error } = await this.supabase
			.from('m_product_packing')
			.insert(data)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to create ProductPacking: ${error.message}`);
		if (!newRecord) throw new Error('Failed to create ProductPacking: No data returned');
		return newRecord;
	}

	async update(id: number, data: ProductPackingUpdate): Promise<ProductPacking> {
		const { data: updatedRecord, error } = await this.supabase
			.from('m_product_packing')
			.update(data)
			.eq('id', id)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to update ProductPacking: ${error.message}`);
		if (!updatedRecord) throw new Error('Failed to update ProductPacking: No data returned');
		return updatedRecord;
	}

	async delete(id: number): Promise<void> {
		const { error } = await this.supabase.from('m_product_packing').delete().eq('id', id);
		if (error) throw new Error(`Failed to delete ProductPacking: ${error.message}`);
	}

	async list(filters?: { m_product_id: number }): Promise<ProductPacking[]> {
		let query = this.supabase.from('m_product_packing').select('*');

		if (filters?.m_product_id) {
			query = query.eq('m_product_id', filters.m_product_id);
		}

		const { data, error } = await query.order('packing_type', { ascending: false });
		if (error) throw new Error(`Failed to list ProductPacking: ${error.message}`);
		return data || [];
	}
}
