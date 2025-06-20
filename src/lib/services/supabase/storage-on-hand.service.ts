import type { Database, Tables } from '$lib/types/supabase.types';
import type { SupabaseClient } from '@supabase/supabase-js';

export type StorageOnHand = Tables<'m_storageonhand'>;

export class StorageOnHandService {
	constructor(private supabase: SupabaseClient<Database>) {}

	async list(filters?: { m_product_id: number }): Promise<StorageOnHand[]> {
		let query = this.supabase.from('m_storageonhand').select('*');

		if (filters?.m_product_id) {
			query = query.eq('m_product_id', filters.m_product_id);
		}

		const { data, error } = await query;
		if (error) throw new Error(`Failed to list StorageOnHand: ${error.message}`);
		return data || [];
	}
}
