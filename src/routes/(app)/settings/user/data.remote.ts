import { form, getRequestEvent } from '$app/server';
import type { UserMetadata } from '@supabase/supabase-js';
import * as z from 'zod';

const userMetadataSchema = z.object({
	locale: z
		.string()
		.regex(/^[a-z]{2,3}(?:-[A-Za-z]{4})?(?:-[A-Z]{2})?$/, 'Invalid locale format')
		.optional(),
	timezone: z.string().optional().default('Europe/Belgrade')
});

export const setUserMetadata = form(userMetadataSchema, async ({ locale, timezone }) => {
	console.log('Setting user metadata, locale:', locale);
	console.log('Setting user metadata, timezone:', timezone);
	const { locals } = getRequestEvent();

	// Check if user is logged in
	if (!locals.user) {
		return { success: false, error: 'User not authenticated' };
	}

	try {
		// Get current user metadata
		const currentMetadata = locals.user.user_metadata || {};

		// Update user metadata in Supabase with flat structure
		// This will add the field if it doesn't exist or update it if it does
		// All other existing metadata will be preserved
		const updateData: UserMetadata = {};

		// Copy all existing metadata to preserve it
		Object.assign(updateData, currentMetadata);

		// Add or update the preferred_user_locale field
		if (locale) {
			updateData.locale = locale;
		}
		if (timezone) {
			updateData.timezone = timezone;
		}

		// Update user metadata in Supabase with flat structure
		const { error } = await locals.supabase.auth.updateUser({
			data: updateData
		});

		if (error) {
			console.error('Error updating user metadata:', error);
			return { success: false, error: error.message };
		}

		return { success: true, metadata: updateData };
	} catch (error) {
		console.error('Unexpected error updating user metadata:', error);
		return { success: false, error: 'Failed to update user metadata' };
	}
});
