import type { SupabaseClient } from '@supabase/supabase-js';

type EntityType = 'Category' | 'Warehouse' | 'Source';

export async function getChannelMap(
	supabase: SupabaseClient,
	channelId: number,
	entityType: EntityType
) {
	const { data, error } = await supabase
		.from('c_channel_map')
		.select('internal_code, channel_code')
		.eq('c_channel_id', channelId)
		.eq('entity_type', entityType);
	if (!data) {
		console.log('no source', error);
	}
	return { data, error };
}
