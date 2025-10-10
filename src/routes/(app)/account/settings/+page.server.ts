import type { PageServerLoad } from './$types';
import { LocaleService } from '$lib/services/supabase/locale.service';

export const load = (async ({ locals: { supabase, session, user } }) => {
	if (!session?.user) {
		return {
			localePreferences: {
				preferredDataLocale: 'sr-Latn-RS',
				availableLocales: []
			}
		};
	}

	try {
		// Load available locales and user preferences in parallel
		const [availableLocales] = await Promise.all([new LocaleService(supabase).getLocales()]);

		return {
			localePreferences: {
				preferredDataLocale: user?.user_metadata.preferred_locale || 'en-US',
				availableLocales
			}
		};
	} catch (error) {
		console.error('Error loading settings data:', error);
		return {
			localePreferences: {
				preferredDataLocale: 'sr-Latn-RS',
				availableLocales: []
			}
		};
	}
}) satisfies PageServerLoad;
