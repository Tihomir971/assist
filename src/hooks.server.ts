import { createServerClient } from '@supabase/ssr';
import { type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

const supabase: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, { ...options, path: '/' });
				});
			}
		}
	});

	event.locals.safeGetSession = async () => {
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

const authGuard: Handle = async ({ event, resolve }) => {
	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = user;

	// Function to check if the request is coming from a mobile device
	const isMobile = (userAgent: string) => {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
	};

	const userAgent = event.request.headers.get('user-agent') || '';

	// Check if the request is for an API route
	if (event.url.pathname.startsWith('/api')) {
		// Allow access only for authenticated users
		if (event.locals.session) {
			return resolve(event);
		} else {
			// Redirect unauthenticated users to the auth page
			return redirect(303, '/auth');
		}
	}

	if (event.locals.session) {
		if (isMobile(userAgent) && !event.url.pathname.startsWith('/mobile')) {
			return redirect(303, '/mobile');
		}
		if (event.url.pathname === '/auth') {
			return redirect(303, '/dashboard');
		}
	} else if (!event.url.pathname.startsWith('/auth')) {
		return redirect(303, '/auth');
	}

	return resolve(event);
};

export const handle: Handle = sequence(supabase, authGuard);
