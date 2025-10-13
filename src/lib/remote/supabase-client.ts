import { getRequestEvent } from '$app/server';
import type { RequestEvent } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { Database } from '@tihomir971/assist-shared';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Create a server Supabase client for a given RequestEvent.
 *
 * Usage:
 *   const supabase = supabaseServer(event);
 *
 * The function accepts an optional RequestEvent; if omitted it will attempt
 * to obtain the current event via getRequestEvent() (useful in some server
 * contexts). Prefer passing the event explicitly where possible.
 */
export const supabaseServer = (e?: RequestEvent): SupabaseClient<Database> =>
	createServerClient<Database, 'public'>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll: () => {
				const event = e ?? getRequestEvent();
				return event.cookies.getAll();
			},
			setAll: (cookiesToSet) => {
				const event = e ?? getRequestEvent();
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, { ...options, path: '/' });
				});
			}
		}
	});
