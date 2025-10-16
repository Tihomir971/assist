import { query } from '$app/server';
import { getRequestEvent } from '$app/server';
import type { Lookup } from '$lib/types/app';

/**
 * Remote query to fetch all active locales from the l_locales table
 * and transform them into value/label pairs using Intl API
 */
export const getLocales = query(async () => {
	const { locals } = getRequestEvent();

	const { data, error } = await locals.supabase
		.from('l_locales')
		.select('code')
		.eq('is_active', true)
		.order('code');

	if (error) throw new Error(`Failed to fetch locales: ${error.message}`);

	// Transform locales to value/label format using Intl API
	const localeLookups: Lookup<string>[] = (data || []).map((locale) => {
		try {
			// Use Intl.DisplayNames to get the localized name of the locale
			const displayNames = new Intl.DisplayNames([locals.app.userLocale], {
				type: 'language',
				fallback: 'code'
			});

			// Get the display name for the locale code
			const displayName = displayNames.of(locale.code);

			return {
				value: locale.code,
				label: displayName || locale.code
			};
		} catch {
			// Fallback to basic format if Intl API fails
			return {
				value: locale.code,
				label: locale.code
			};
		}
	});

	return localeLookups;
});
