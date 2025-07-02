import type { Database, Tables } from '@tihomir971/assist-shared';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CRUDService } from '../base/crud.service';

export type Brand = Tables<'m_product_brands'>;
export type BrandCreate = Omit<Brand, 'id' | 'created_at' | 'updated_at'>;
export type BrandUpdate = Partial<BrandCreate>;
export type BrandLookup = { value: number; label: string };

export class BrandService implements CRUDService<Brand, BrandCreate, BrandUpdate> {
	constructor(private supabase: SupabaseClient<Database>) {}

	async getById(id: number): Promise<Brand | null> {
		const { data, error } = await this.supabase
			.from('m_product_brands')
			.select('*')
			.eq('id', id)
			.maybeSingle();

		if (error) throw new Error(`Failed to fetch brand: ${error.message}`);
		return data;
	}

	async create(data: BrandCreate): Promise<Brand> {
		const { data: newBrand, error } = await this.supabase
			.from('m_product_brands')
			.insert(data)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to create brand: ${error.message}`);
		if (!newBrand) throw new Error('Failed to create brand: No data returned');
		return newBrand;
	}

	async update(id: number, data: BrandUpdate): Promise<Brand> {
		const { data: updatedBrand, error } = await this.supabase
			.from('m_product_brands')
			.update(data)
			.eq('id', id)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to update brand: ${error.message}`);
		if (!updatedBrand) throw new Error('Failed to update brand: No data returned');
		return updatedBrand;
	}

	async delete(id: number): Promise<void> {
		const { error } = await this.supabase.from('m_product_brands').delete().eq('id', id);
		if (error) throw new Error(`Failed to delete brand: ${error.message}`);
	}

	async list(filters?: Record<string, unknown>): Promise<Brand[]> {
		let query = this.supabase.from('m_product_brands').select('*');

		if (filters?.is_active !== undefined) {
			query = query.eq('is_active', filters.is_active as boolean);
		}

		const { data, error } = await query.order('name');
		if (error) throw new Error(`Failed to list brands: ${error.message}`);
		return data || [];
	}

	async getLookup(): Promise<BrandLookup[]> {
		const { data, error } = await this.supabase
			.from('m_product_brands')
			.select('value:id, label:name')
			.eq('is_active', true)
			.order('name')
			.limit(1000); // Limit to 1000 active brands

		if (error) throw new Error(`Failed to load brand lookup: ${error.message}`);
		return data || [];
	}
}
