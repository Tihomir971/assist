import type { PageServerLoad } from './$types';
import { LocaleService } from '$lib/services/supabase/locale.service';
import { UserPreferencesService } from '$lib/services/supabase/user-preferences.service';

export const load = (async ({ locals: { supabase, session } }) => {
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
		const [availableLocales, userPreferences] = await Promise.all([
			new LocaleService(supabase).getLocales(),
			new UserPreferencesService(supabase).getUserPreferences(session.user.id)
		]);

		return {
			localePreferences: {
				preferredDataLocale: userPreferences?.preferred_data_locale || 'sr-Latn-RS',
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
