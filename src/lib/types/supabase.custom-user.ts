import type { User, UserMetadata } from '@supabase/supabase-js';

interface CustomUserMetadata extends UserMetadata {
	preferred_locale?: string;
}

export interface SupabaseUser extends Omit<User, 'user_metadata'> {
	user_metadata: CustomUserMetadata;
}
