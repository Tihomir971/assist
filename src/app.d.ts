// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
import { SupabaseClient, Session } from '@supabase/supabase-js';
import { Database } from '$lib/types/database.types';
import { AppUser } from '$lib/types/';

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient<Database>;
			getSession(): Promise<Session | null>;
			user: AppUser;
		}
		interface PageData {
			session: Session | null;
		}
		interface PageState {}
		// interface Error {}
		interface Platform {
			env: {
				COUNTER: DurableObjectNamespace;
			};
			context: {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				waitUntil(promise: Promise<any>): void;
			};
			caches: CacheStorage & { default: Cache };
		}
	}
}
