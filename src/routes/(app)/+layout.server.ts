import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { LocaleService } from '$lib/services/supabase/locale.service';
import { UserPreferencesService } from '$lib/services/supabase/user-preferences.service';

/**
 * This file is necessary to ensure protection of all routes in the `private`
 * directory. It makes the routes in this directory _dynamic_ routes, which
 * send a server request, and thus trigger `hooks.server.ts`.
 **/
export const load: LayoutServerLoad = async ({ locals: { supabase, safeGetSession }, depends }) => {
	// Keep depends for user preferences; category tree will be loaded client-side via in-memory cache
	depends('user:preferences');

	const { session } = await safeGetSession();

	if (!session) {
		redirect(303, '/');
	}

	const localeService = new LocaleService(supabase);
	const preferencesService = new UserPreferencesService(supabase);

	// Load profile, locales and user preferences in parallel; category tree removed from server load
	const [profile, availableLocales, userPreferences] = await Promise.all([
		supabase
			.from('ad_user')
			.select('first_name, last_name, avatar_url')
			.eq('auth_user_id', session.user.id)
			.single()
			.then(({ data }) => data),
		localeService.getLocales(),
		preferencesService.getUserPreferences(session.user.id)
	]);

	// Determine effective data locale
	const defaultLocale = availableLocales.find((l) => l.isDefault)?.value || 'sr-Latn-RS';
	const effectiveDataLocale = userPreferences?.preferred_data_locale || defaultLocale;

	return {
		session,
		profile,
		// categoryTree intentionally removed — client will initialize and fetch as needed
		localePreferences: {
			preferredDataLocale: effectiveDataLocale,
			availableLocales
		}
	};
};
