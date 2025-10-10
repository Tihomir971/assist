// import type { Database } from '@tihomir971/assist-shared';
import type { Database } from '$lib/types/supabase';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import type { SupabaseUser } from '$lib/types/supabase.custom-user';
import 'unplugin-icons/types/svelte';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabase: SupabaseClient<Database>;
			safeGetSession: () => Promise<{ session: Session | null; user: SupabaseUser | null }>;
			session: Session | null;
			user: SupabaseUser | null;
		}
		interface PageData {
			session: Session | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
