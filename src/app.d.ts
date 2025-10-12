// import type { Database } from '@tihomir971/assist-shared';
import type { Database } from '$lib/types/supabase.types';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import type { AppSettings } from '$lib/types/app';

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
			app: AppSettings | undefined;
		}
		interface PageData {
			session: Session | null;
			app: AppSettings | undefined;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
