import { TreeCollection } from '@zag-js/collection';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/supabase.types';
import { CategoryService, type TreeStructure } from '$lib/services/supabase/category.service';

/**
 * Simple in-memory category cache
 *
 * Usage:
 *  - import { initializeCategoryCache, categoryCache } from '$lib/stores/category-cache.svelte';
 *  - const cache = initializeCategoryCache(supabase);
 *  - await cache.getCategories(userLocale);
 *
 * Notes:
 *  - Cache is kept in-memory only; cleared on page refresh.
 *  - Cache is locale-aware and uses a short TTL (30 minutes by default).
 */

interface CacheEntry {
	data: TreeStructure[];
	timestamp: number;
	userLocale: string;
}

class SimpleCategoryCache {
	private cache: CacheEntry | null = null;
	private treeCollection: TreeCollection<TreeStructure> | null = null;
	private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
	private loadingPromise: Promise<TreeStructure[]> | null = null; // Prevent concurrent loads

	private supabase: SupabaseClient<Database>;
	// Reactive-ish fields: using simple primitives here so callers can check properties
	private _isLoading = false;
	private _error: string | null = null;

	constructor(supabase: SupabaseClient<Database>) {
		this.supabase = supabase;
	}

	// Read-only accessors for state
	get loading() {
		return this._isLoading;
	}

	get error() {
		return this._error;
	}

	/**
	 * Check if current cache entry is valid for the given locale
	 */
	private isValid(userLocale: string): boolean {
		if (!this.cache) return false;
		const now = Date.now();
		return this.cache.userLocale === userLocale && now - this.cache.timestamp < this.CACHE_DURATION;
	}

	/**
	 * Get categories (tree) for the userLocale. Uses cache when valid.
	 * Prevents concurrent loading requests.
	 */
	async getCategories(userLocale: string = 'sr-Latn-RS'): Promise<TreeStructure[]> {
		if (this.isValid(userLocale)) {
			return this.cache!.data;
		}

		// If already loading for this locale, return the existing promise
		if (this.loadingPromise && this._isLoading) {
			return this.loadingPromise;
		}

		return await this.loadFresh(userLocale);
	}

	/**
	 * Produce a flat lookup [{ value, label }] by traversing the tree.
	 */
	async getLookup(
		userLocale: string = 'sr-Latn-RS'
	): Promise<Array<{ value: number; label: string }>> {
		const categories = await this.getCategories(userLocale);
		const result: Array<{ value: number; label: string }> = [];

		const flatten = (items: TreeStructure[]) => {
			for (const item of items) {
				result.push({ value: item.value, label: item.label });
				if (item.children && item.children.length > 0) {
					flatten(item.children);
				}
			}
		};

		flatten(categories);
		return result;
	}

	/**
	 * Get (or create) a TreeCollection for advanced descendant operations.
	 * Note: TreeCollection is recreated if cache is invalidated.
	 */
	async getTreeCollection(
		userLocale: string = 'sr-Latn-RS'
	): Promise<TreeCollection<TreeStructure>> {
		const categories = await this.getCategories(userLocale);

		if (!this.treeCollection) {
			this.treeCollection = new TreeCollection<TreeStructure>({
				rootNode: {
					value: 0,
					label: 'Root',
					children: categories
				} as TreeStructure,
				nodeToValue: (node) => node.value.toString(),
				nodeToString: (node) => node.label,
				nodeToChildren: (node) => node.children || []
			});
		}

		return this.treeCollection;
	}

	/**
	 * Force refresh the cache and return fresh data.
	 */
	async refresh(userLocale: string = 'sr-Latn-RS'): Promise<TreeStructure[]> {
		this.invalidate();
		return await this.loadFresh(userLocale);
	}

	/**
	 * Internal: Load categories from CategoryService and cache them.
	 */
	private async loadFresh(userLocale: string): Promise<TreeStructure[]> {
		// Prevent concurrent loads
		if (this.loadingPromise && this._isLoading) {
			return this.loadingPromise;
		}

		this._isLoading = true;
		this._error = null;

		this.loadingPromise = (async () => {
			try {
				const categoryService = new CategoryService(this.supabase);
				const data = await categoryService.getCategoryTree(userLocale);

				// Cache result in-memory
				this.cache = {
					data,
					timestamp: Date.now(),
					userLocale
				};

				// Reset TreeCollection so it will be recreated on next getTreeCollection()
				this.treeCollection = null;

				return data;
			} catch (err) {
				this._error = err instanceof Error ? err.message : 'Failed to load categories';
				throw err;
			} finally {
				this._isLoading = false;
				this.loadingPromise = null;
			}
		})();

		return this.loadingPromise;
	}

	/**
	 * Invalidate in-memory cache and TreeCollection.
	 */
	invalidate() {
		this.cache = null;
		this.treeCollection = null;
		this.loadingPromise = null;
		this._isLoading = false;
		this._error = null;
	}
}

// Exported singleton reference (may be initialized later)
export let categoryCache: SimpleCategoryCache | undefined;

/**
 * Initialize the singleton SimpleCategoryCache with a Supabase client.
 * Calling multiple times returns the same instance.
 */
export function initializeCategoryCache(supabase: SupabaseClient<Database>) {
	if (!categoryCache) {
		categoryCache = new SimpleCategoryCache(supabase);
	}
	return categoryCache;
}
