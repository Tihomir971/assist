import type { Database } from '@tihomir971/assist-shared';
import type { SupabaseClient } from '@supabase/supabase-js';

export type TaxCategoryLookup = { value: number; label: string };

export class TaxCategoryService {
	constructor(private supabase: SupabaseClient<Database>) {}

	async getLookup(): Promise<TaxCategoryLookup[]> {
		const { data, error } = await this.supabase
			.from('c_taxcategory')
			.select('value:id, label:name')
			.order('name');

		if (error) throw new Error(`Failed to load TaxCategory lookup: ${error.message}`);
		return data || [];
	}
}
