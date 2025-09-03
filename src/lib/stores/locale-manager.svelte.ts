import type { LocaleLookup } from '$lib/types/multilingual.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/supabase';
import { browser } from '$app/environment';
import { SvelteDate } from 'svelte/reactivity';
import { setContext, getContext } from 'svelte';

export interface LocaleState {
	preferredDataLocale: string;
	availableLocales: LocaleLookup[];
	isLoading: boolean;
	isUpdating: boolean;
	lastUpdated: Date | null;
	error: string | null;
}

export class LocaleManager {
	private _state = $state<LocaleState>({
		preferredDataLocale: 'sr-Latn-RS',
		availableLocales: [],
		isLoading: false,
		isUpdating: false,
		lastUpdated: null,
		error: null
	});

	constructor(
		private supabase: SupabaseClient<Database>,
		private userId: string,
		initialState?: Partial<LocaleState>
	) {
		if (initialState) {
			Object.assign(this._state, initialState);
		}
	}

	// Reactive getters
	get currentDataLocale(): string {
		return this._state.preferredDataLocale;
	}

	get availableLocales(): LocaleLookup[] {
		return this._state.availableLocales;
	}

	get isLoading(): boolean {
		return this._state.isLoading;
	}

	get isUpdating(): boolean {
		return this._state.isUpdating;
	}

	get error(): string | null {
		return this._state.error;
	}

	get state(): LocaleState {
		return this._state;
	}

	/**
	 * Initialize with server data
	 */
	initialize(data: { preferredDataLocale: string; availableLocales: LocaleLookup[] }): void {
		this._state.preferredDataLocale = data.preferredDataLocale;
		this._state.availableLocales = data.availableLocales;
		this._state.error = null;
	}

	/**
	 * Update preferred data locale using direct Supabase call
	 */
	async updatePreferredDataLocale(locale: string): Promise<boolean> {
		if (!browser) return false;

		// Validate locale exists in available locales
		const localeExists = this._state.availableLocales.some((l) => l.value === locale);
		if (!localeExists) {
			this._state.error = `Locale ${locale} is not available`;
			return false;
		}

		this._state.isUpdating = true;
		this._state.error = null;

		try {
			// First check if user exists
			const { data: existingUser, error: fetchError } = await this.supabase
				.from('ad_user')
				.select('id, preferences')
				.eq('auth_user_id', this.userId)
				.single();

			if (fetchError) {
				throw new Error(`User not found: ${fetchError.message}`);
			}

			// Get existing preferences and merge
			const existingPrefs = (existingUser?.preferences as Record<string, unknown>) || {};
			const updatedPrefs = { ...existingPrefs, preferred_data_locale: locale };
			console.log('Saving locale preference:', updatedPrefs, this.userId);
			// Direct Supabase call like CategoryService - no service layer
			const { data, error } = await this.supabase
				.from('ad_user')
				.update({
					preferences: updatedPrefs
				})
				.eq('auth_user_id', this.userId)
				.select('*');

			if (error) throw error;
			console.log('Updated user preferences:', data);
			// Update local state only after successful database update
			this._state.preferredDataLocale = locale;
			this._state.lastUpdated = new SvelteDate();
			return true;
		} catch (error) {
			this._state.error = error instanceof Error ? error.message : 'Failed to update preference';
			return false;
		} finally {
			this._state.isUpdating = false;
		}
	}
}

// Context key for LocaleManager
const LOCALE_MANAGER_KEY = Symbol('localeManager');

/**
 * Set LocaleManager in Svelte context (called from +layout.svelte)
 */
export function setLocaleManagerContext(manager: LocaleManager): void {
	setContext(LOCALE_MANAGER_KEY, manager);
}

/**
 * Get LocaleManager from Svelte context
 */
export function getLocaleManagerContext(): LocaleManager {
	const manager = getContext<LocaleManager>(LOCALE_MANAGER_KEY);
	if (!manager) {
		throw new Error(
			'LocaleManager not found in context. Make sure it is initialized in +layout.svelte'
		);
	}
	return manager;
}

/**
 * Get LocaleManager from context (safe version that returns null if not found)
 */
export function getLocaleManagerContextSafe(): LocaleManager | null {
	return getContext<LocaleManager>(LOCALE_MANAGER_KEY) || null;
}

export function getLocaleManagerState(): LocaleState | null {
	const manager = getLocaleManagerContextSafe();
	return manager?.state || null;
}
