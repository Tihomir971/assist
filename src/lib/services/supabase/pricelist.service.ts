import type { Database } from '$lib/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CRUDService } from '../base/crud.service';
import type { MPricelistInsert, MPricelistRow, MPricelistUpdate } from '$lib/types/supabase.zod';

export type PricelistLookup = { value: number; label: string };

export class PriceListService
	implements CRUDService<MPricelistRow, MPricelistInsert, MPricelistUpdate>
{
	constructor(private supabase: SupabaseClient<Database>) {}

	async getById(id: number): Promise<MPricelistRow | null> {
		const { data, error } = await this.supabase
			.from('m_pricelist')
			.select('*')
			.eq('id', id)
			.maybeSingle();

		if (error) throw new Error(`Failed to fetch category: ${error.message}`);
		return data;
	}

	async create(data: MPricelistInsert): Promise<MPricelistRow> {
		const { data: newCategory, error } = await this.supabase
			.from('m_pricelist')
			.insert(data)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to create category: ${error.message}`);
		if (!newCategory) throw new Error('Failed to create category: No data returned'); // Added null check
		return newCategory;
	}

	async update(id: number, data: MPricelistUpdate): Promise<MPricelistRow> {
		const { data: updatedCategory, error } = await this.supabase
			.from('m_pricelist')
			.update(data)
			.eq('id', id)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to update category: ${error.message}`);
		if (!updatedCategory) throw new Error('Failed to update category: No data returned'); // Added null check
		return updatedCategory;
	}

	async delete(id: number): Promise<void> {
		const { error } = await this.supabase.from('m_product_category').delete().eq('id', id);

		if (error) throw new Error(`Failed to delete category: ${error.message}`);
	}

	async list(filters?: Record<string, unknown>): Promise<MPricelistRow[]> {
		// Changed any to unknown
		let query = this.supabase.from('m_pricelist').select('*');

		if (filters?.is_active !== undefined) {
			query = query.eq('is_active', filters.is_active as boolean); // Added type assertion
		}

		const { data, error } = await query.order('name');
		if (error) throw new Error(`Failed to list categories: ${error.message}`);
		return data || [];
	}
}
