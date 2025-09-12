import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/supabase';
import { UserPreferencesService } from '$lib/services/supabase/user-preferences.service';

// Cache for default locale to avoid repeated database queries
let defaultLocaleCache: string | null = null;
let defaultLocaleCacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Get current user's preferred locale from database
 * This is the key function that services use to automatically detect locale
 */
// Cache for user locale to avoid repeated database queries
const userLocaleCache: { [userId: string]: { locale: string; timestamp: number } } = {};
const USER_LOCALE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getCurrentUserLocale(supabase: SupabaseClient<Database>): Promise<string> {
	try {
		// Get current user from Supabase auth
		const {
			data: { user }
		} = await supabase.auth.getUser();

		if (!user) {
			// Get default locale from l_locales table
			return await getDefaultLocale(supabase);
		}

		// Check cache first
		const now = Date.now();
		const cached = userLocaleCache[user.id];
		if (cached && now - cached.timestamp < USER_LOCALE_CACHE_DURATION) {
			return cached.locale;
		}

		// Get default locale and user preferences in parallel
		const [defaultLocale, preferencesService] = await Promise.all([
			getDefaultLocale(supabase),
			Promise.resolve(new UserPreferencesService(supabase))
		]);

		const preferences = await preferencesService.getUserPreferences(user.id);
		const userLocale = preferences?.preferred_data_locale || defaultLocale;

		// Cache the result
		userLocaleCache[user.id] = {
			locale: userLocale,
			timestamp: now
		};

		return userLocale;
	} catch (error) {
		console.warn('Failed to get user locale, using fallback:', error);
		// If everything fails, return a hardcoded fallback
		return 'sr-Latn-RS';
	}
}

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
