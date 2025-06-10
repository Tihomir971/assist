// src/lib/server/supabase-admin.ts
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { env } from '$env/dynamic/private';

let _supabaseAdmin: ReturnType<typeof createClient> | null = null;

export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient>, {
	get(target, prop) {
		if (!_supabaseAdmin) {
			if (!env.SUPABASE_SERVICE_ROLE_KEY) {
				throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
			}
			_supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
				auth: {
					autoRefreshToken: false,
					persistSession: false
				}
			});
		}
		return _supabaseAdmin[prop as keyof typeof _supabaseAdmin];
	}
});
