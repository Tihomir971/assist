import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/supabase.types';

// Cache for default locale to avoid repeated database queries
let defaultLocaleCache: string | null = null;
let defaultLocaleCacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Get default locale from l_locales table with caching
 */
export async function getDefaultLocale(supabase: SupabaseClient<Database>): Promise<string> {
	const now = Date.now();

	// Return cached value if it's still valid
	if (defaultLocaleCache && now - defaultLocaleCacheTime < CACHE_DURATION) {
		return defaultLocaleCache;
	}
	// Fetching default locale from database (cached for 5 minutes)
	try {
		const { data, error } = await supabase
			.from('l_locales')
			.select('code')
			.eq('is_default', true)
			.eq('is_active', true)
			.single();

		if (error || !data) {
			console.warn('No default locale found in l_locales, using fallback');
			const fallback = 'sr-Latn-RS';
			// Cache the fallback too
			defaultLocaleCache = fallback;
			defaultLocaleCacheTime = now;
			return fallback;
		}

		// Cache the result
		defaultLocaleCache = data.code;
		defaultLocaleCacheTime = now;
		return data.code;
	} catch (error) {
		console.warn('Failed to get default locale from database:', error);
		const fallback = 'sr-Latn-RS';
		// Cache the fallback
		defaultLocaleCache = fallback;
		defaultLocaleCacheTime = now;
		return fallback;
	}
}
