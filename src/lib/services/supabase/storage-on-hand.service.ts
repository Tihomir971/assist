import type { Database, Tables } from '@tihomir971/assist-shared';
import type { SupabaseClient } from '@supabase/supabase-js';

export class StorageOnHandService {
	constructor(private supabase: SupabaseClient<Database>) {}

	async list(filters?: { m_product_id: number }): Promise<Tables<'m_storageonhand'>[]> {
		let query = this.supabase.from('m_storageonhand').select('*');

		if (filters?.m_product_id) {
			query = query.eq('m_product_id', filters.m_product_id);
		}

		const { data, error } = await query;
		if (error) throw new Error(`Failed to list StorageOnHand: ${error.message}`);
		return data || [];
	}
}
