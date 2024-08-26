import type { SupabaseClient } from '@supabase/supabase-js';

export async function getChannelMap(supabase: SupabaseClient, channelId: number) {
	const { data, error } = await supabase
		.from('c_channel_map')
		.select('entity_type, internal_code, channel_code')
		.eq('c_channel_id', channelId);
	if (!data) {
		console.log('no source', error);
	}
	return { data, error };
}
