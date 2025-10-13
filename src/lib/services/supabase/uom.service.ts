import type { Database, Tables } from '@tihomir971/assist-shared';
import type { SupabaseClient } from '@supabase/supabase-js';

export type UOM = Tables<'c_uom'>;
export type UOMLookup = { value: number; label: string; symbol?: string | null };

export class UOMService {
	constructor(public supabase: SupabaseClient<Database>) {}

	async getLookup(): Promise<UOMLookup[]> {
		const { data, error } = await this.supabase
			.from('c_uom')
			.select('value:id, label:name, symbol:uomsymbol')
			.eq('is_active', true)
			.order('name');

		if (error) throw new Error(`Failed to load UOM lookup: ${error.message}`);
		return data || [];
	}

	async getById(id: number): Promise<UOM | null> {
		const { data, error } = await this.supabase
			.from('c_uom')
			.select('*')
			.eq('id', id)
			.maybeSingle();

		if (error) throw new Error(`Failed to fetch UOM: ${error.message}`);
		return data;
	}
}
