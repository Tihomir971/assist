import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { CategoryService } from '$lib/services/supabase/category.service';
import { LocaleService } from '$lib/services/supabase/locale.service';
import { UserPreferencesService } from '$lib/services/supabase/user-preferences.service';

/**
 * This file is necessary to ensure protection of all routes in the `private`
 * directory. It makes the routes in this directory _dynamic_ routes, which
 * send a server request, and thus trigger `hooks.server.ts`.
 **/
export const load: LayoutServerLoad = async ({ locals: { supabase, safeGetSession }, depends }) => {
	depends('catalog:categories');
	depends('user:preferences');

	const { session } = await safeGetSession();

	if (!session) {
		redirect(303, '/');
	}

	const categoryService = new CategoryService(supabase);
	const localeService = new LocaleService(supabase);
	const preferencesService = new UserPreferencesService(supabase);

	const [profile, categoryTree, availableLocales, userPreferences] = await Promise.all([
		supabase
			.from('ad_user')
			.select('first_name, last_name, avatar_url')
			.eq('auth_user_id', session.user.id)
			.single()
			.then(({ data }) => data),
		categoryService.getCategoryTree(),
		localeService.getLocales(),
		preferencesService.getUserPreferences(session.user.id)
	]);

	// Determine effective data locale
	const defaultLocale = availableLocales.find((l) => l.isDefault)?.value || 'sr-Latn-RS';
	const effectiveDataLocale = userPreferences?.preferred_data_locale || defaultLocale;

	return {
		session,
		profile,
		categoryTree,
		localePreferences: {
			preferredDataLocale: effectiveDataLocale,
			availableLocales
		}
	};
};
