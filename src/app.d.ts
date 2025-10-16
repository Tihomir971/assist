import type { Database } from '@tihomir971/assist-shared';
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import type { AppContext } from '$lib/types/app';

import 'unplugin-icons/types/svelte';

declare module '@supabase/supabase-js' {
	interface UserMetadata {
		locale?: string;
		timezone?: string;
	}
}

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			supabase: SupabaseClient<Database>;
			safeGetSession: () => Promise<{ session: Session | null; user: User | null }>;
			session: Session | null;
			user: User | null;
			app: AppContext;
		}
		interface PageData {
			session: Session | null;
			app: AppContext;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
