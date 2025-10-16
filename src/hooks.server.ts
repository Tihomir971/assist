import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '@tihomir971/assist-shared';
import { createServerClient } from '@supabase/ssr';
import { type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

const supabase: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient<Database, 'public'>(
		PUBLIC_SUPABASE_URL,
		PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				getAll: () => event.cookies.getAll(),
				setAll: (cookiesToSet) => {
					cookiesToSet.forEach(({ name, value, options }) => {
						event.cookies.set(name, value, { ...options, path: '/' });
					});
				}
			}
		}
	);

	/**
	 * Unlike `supabase.auth.getSession()`, which returns the session _without_
	 * validating the JWT, this function also calls `getUser()` to validate the
	 * JWT before returning the session.
	 */
	event.locals.safeGetSession = async () => {
		/** @ts-expect-error: suppressGetSessionWarning is not officially supported */
		event.locals.supabase.auth.suppressGetSessionWarning = true;
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		if (!session) {
			return { session: null, user: null };
		}

		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();
		if (error) {
			return { session: null, user: null };
		}

		return { session, user };
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};

const appSettingsHandle: Handle = async ({ event, resolve }) => {
	// Initialize app settings if not already present
	if (!event.locals.app) {
		const { data, error } = await event.locals.supabase
			.from('ad_client')
			.select('ad_language')
			.single();

		// Always set app settings, even if there's an error
		event.locals.app = {
			systemLocale: data?.ad_language || 'en',
			userLocale: event.locals.user?.user_metadata?.locale || data?.ad_language || 'sr-Latn-RS'
		};

		if (error) {
			console.log('Error fetching app settings:', error);
		}
	}
	const response = await resolve(event);
	return response;
};
const authGuard: Handle = async ({ event, resolve }) => {
	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = user;

	// Function to check if the request is coming from a mobile device
	const isMobile = (userAgent: string) => {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
	};

	const userAgent = event.request.headers.get('user-agent') || '';

	// From: https://github.com/j4w8n/sveltekit-supabase-ssr/blob/main/src/hooks.server.ts
	/**
	 * Only authenticated users can access these paths and their sub-paths.
	 *
	 * If you'd rather do this in your routes, see (authenticated)/app/+page.server.ts
	 * for an example.
	 *
	 * If you don't use a layout group for auth-protected paths, then you can use
	 * new Set(['app', 'self']) or whatever your top-level path segments are, and
	 * .has(event.url.pathname.split('/')[1])
	 */
	const auth_protected_paths = new Set(['(app)', '/']);
	if (!session && auth_protected_paths.has(event.route.id?.split('/')[1] || ''))
		redirect(307, '/auth');

	if (isMobile(userAgent) && !event.url.pathname.startsWith('/mobile')) {
		return redirect(303, '/mobile');
	}
	if (event.url.pathname === '/auth' || event.url.pathname === '/') {
		return redirect(303, '/dashboard');
	}
	const response = await resolve(event);

	return response;
};

export const handle: Handle = sequence(supabase, authGuard, appSettingsHandle);
