import { query } from '$app/server';
import { getRequestEvent } from '$app/server';

export type LocaleLookup = { value: string; label: string };

/**
 * Remote query to fetch all active locales from the l_locales table
 * and transform them into value/label pairs using Intl API
 */
export const getLocales = query(async () => {
	const { locals } = getRequestEvent();

	// Get the user's preferred locale from their metadata, fallback to 'en'
	const userLocale = locals.app.userLocale || locals.app.systemLocale || 'en';

	const { data, error } = await locals.supabase
		.from('l_locales')
		.select('*')
		.eq('is_active', true)
		.order('is_default', { ascending: false })
		.order('code');

	if (error) throw new Error(`Failed to fetch locales: ${error.message}`);

	// Transform locales to value/label format using Intl API
	const localeLookups: LocaleLookup[] = (data || []).map((locale) => {
		try {
			// Use Intl.DisplayNames to get the localized name of the locale
			const displayNames = new Intl.DisplayNames([userLocale], {
				type: 'language',
				fallback: 'code'
			});

			// Get the display name for the locale code
			const displayName = displayNames.of(locale.code);

			// Format the label with both display name and native name if available
			const label = displayName || locale.code;

			return {
				value: locale.code,
				label
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
