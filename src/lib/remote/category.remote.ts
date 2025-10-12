import { getRequestEvent, query } from '$app/server';
import { z } from 'zod';
import { getRPCLookup } from '$lib/services/supabase/category.service';
import { supabaseServer } from './supabase-client';
import { getDefaultLocale } from '$lib/utils/locale.utils';

// Remote query to search categories (safe server-side entrypoint)
export const searchCategories = query(z.string(), async (q: string) => {
	const { locals } = getRequestEvent();
	if (!q) return [];

	// Create a server Supabase client (no cookies available in this context).
	// For lookups that don't require per-user auth this is sufficient.
	const event = getRequestEvent();
	const supabase = supabaseServer(event);
	const fallbackLocale = await getDefaultLocale(supabase);
	const preferredLocale = locals.user?.user_metadata.preferred_locale || 'en-US';

	const data = await getRPCLookup(
		supabase,
		'm_product_category',
		'names',
		preferredLocale,
		fallbackLocale,
		{ searchTerm: q, filterActive: true }
	);

	return data || [];
});
