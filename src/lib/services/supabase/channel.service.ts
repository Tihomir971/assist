import type { Database } from '$lib/types/supabase.types';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ChannelLookup = { value: number; label: string };

export class ChannelService {
	constructor(private supabase: SupabaseClient<Database>) {}

	async getChannelLookup(): Promise<ChannelLookup[]> {
		const { data, error } = await this.supabase.from('c_channel').select('label:name, value:id');

		if (error) throw new Error(`Failed to load channel lookup: ${error.message}`);
		return data || [];
	}
}
