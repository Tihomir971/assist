import { supabase } from '$lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Tables } from '$lib/types/supabase';

export type Locale = Tables<'l_locales'>;
export type LocaleLookup = { value: string; label: string; isDefault: boolean };

export class LocaleService {
	private localeCache: Locale[] | null = null;
	private cacheTimestamp: number = 0;
	private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

	constructor(private supabase: SupabaseClient<Database>) {}

	async getLocales(): Promise<LocaleLookup[]> {
		if (this.isCacheValid()) {
			return this.transformLocales(this.localeCache!);
		}

		const { data, error } = await this.supabase
			.from('l_locales')
			.select('*')
			.eq('is_active', true)
			.order('is_default', { ascending: false })
			.order('name');
		if (error) throw new Error(`Failed to fetch locales: ${error.message}`);

		this.localeCache = data || [];
		this.cacheTimestamp = Date.now();
		return this.transformLocales(this.localeCache);
	}

	async getDefaultLocale(): Promise<Locale | null> {
		const locales = this.localeCache ?? (await this.getActiveLocales());
		return locales.find((locale) => locale.is_default) || null;
	}

	private transformLocales(locales: Locale[]): LocaleLookup[] {
		return locales.map((locale) => ({
			value: locale.code,
			// label: `${locale.name} (${locale.native_name || locale.code})`,
			label: locale.name,
			isDefault: locale.is_default
		}));
	}

	public async getActiveLocales(): Promise<Locale[]> {
		if (this.isCacheValid()) {
			return this.localeCache!;
		}
		const { data, error } = await this.supabase
			.from('l_locales')
			.select('*')
			.eq('is_active', true)
			.order('is_default', { ascending: false })
			.order('name');

		if (error) throw new Error(`Failed to fetch locales: ${error.message}`);
		this.localeCache = data || [];
		this.cacheTimestamp = Date.now();
		return this.localeCache;
	}

	private isCacheValid(): boolean {
		return this.localeCache !== null && Date.now() - this.cacheTimestamp < this.CACHE_DURATION;
	}

	clearCache(): void {
		this.localeCache = null;
		this.cacheTimestamp = 0;
	}
}

export const localeService = new LocaleService(supabase);
