import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/supabase';
import type { UserPreferences } from '$lib/types/user-preferences.types';

export class UserPreferencesService {
	constructor(private supabase: SupabaseClient<Database>) {}

	/**
	 * Get user preferences by auth_user_id with proper type handling
	 */
	async getUserPreferences(authUserId: string): Promise<UserPreferences | null> {
		const { data, error } = await this.supabase
			.from('ad_user')
			.select('preferences')
			.eq('auth_user_id', authUserId)
			.single();

		if (error) {
			console.error('Failed to fetch user preferences:', error);
			return null;
		}

		// Direct return like CategoryService - no parsing or validation
		return (data?.preferences as UserPreferences) || {};
	}
}
