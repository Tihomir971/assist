import type { Database, Tables } from '$lib/types/supabase.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CRUDService } from '../base/crud.service';

export type Product = Tables<'m_product'>;
export type ProductCreate = Omit<Product, 'id' | 'created_at' | 'updated_at'>;
export type ProductUpdate = Partial<ProductCreate>;
export type ProductLookup = { value: number; label: string };

export class ProductService implements CRUDService<Product, ProductCreate, ProductUpdate> {
	constructor(private supabase: SupabaseClient<Database>) {}

	async getById(id: number): Promise<Product | null> {
		const { data, error } = await this.supabase
			.from('m_product')
			.select('*')
			.eq('id', id)
			.maybeSingle();

		if (error) throw new Error(`Failed to fetch Product: ${error.message}`);
		return data;
	}

	async create(data: ProductCreate): Promise<Product> {
		const { data: newProduct, error } = await this.supabase
			.from('m_product')
			.insert(data)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to create Product: ${error.message}`);
		if (!newProduct) throw new Error('Failed to create Product: No data returned');
		return newProduct;
	}

	async update(id: number, data: ProductUpdate): Promise<Product> {
		const { data: updatedProduct, error } = await this.supabase
			.from('m_product')
			.update(data)
			.eq('id', id)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to update Product: ${error.message}`);
		if (!updatedProduct) throw new Error('Failed to update Product: No data returned');
		return updatedProduct;
	}

	async delete(id: number): Promise<void> {
		const { error } = await this.supabase.from('m_product').delete().eq('id', id);
		if (error) throw new Error(`Failed to delete Product: ${error.message}`);
	}

	async list(filters?: Record<string, unknown>): Promise<Product[]> {
		let query = this.supabase.from('m_product').select('*');

		if (filters?.is_active !== undefined) {
			query = query.eq('is_active', filters.is_active as boolean);
		}

		const { data, error } = await query.order('name');
		if (error) throw new Error(`Failed to list Products: ${error.message}`);
		return data || [];
	}

	async getLookup(): Promise<ProductLookup[]> {
		const { data, error } = await this.supabase
			.from('m_product')
			.select('value:id, label:name')
			.eq('is_active', true)
			.order('name');

		if (error) throw new Error(`Failed to load Product lookup: ${error.message}`);
		return data || [];
	}

	async getUoms(): Promise<{ value: number; label: string }[]> {
		const { data } = await this.supabase.from('c_uom').select('value:id, label:name').order('name');
		return data || [];
	}
}
