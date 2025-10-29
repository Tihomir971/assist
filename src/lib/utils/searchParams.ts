import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import { z } from 'zod';

/**
 * Creates a helper for managing URL search parameters with Zod schema validation
 *
 * @example
 * ```typescript
 * // Create helper instance
 * const searchParamsHelper = createSearchParamsHelper(ZodSchema);
 *
 * // In a Svelte component:
 * // Parse current URL search parameters
 * const searchParams = $derived(searchParamsHelper.parse(page.url.searchParams));
 *
 * // Update search parameters
 * function handleSearch(query: string) {
 *   searchParamsHelper.update(page.url, {
 *     search: query || null,
 *     page: 1 // Reset to first page when searching
 *   });
 * }
 * ```
 */
export function createSearchParamsHelper<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
	type Params = z.infer<typeof schema>;

	return {
		/**
		 * Parse URLSearchParams into typed object using the provided schema
		 * @param searchParams - URLSearchParams to parse
		 * @returns Typed object matching the schema
		 */
		parse: (searchParams: URLSearchParams): Params => {
			const entries = Array.from(searchParams.entries()).map(([key, value]) => {
				if (value === 'true') return [key, true];
				if (value === 'false') return [key, false];
				return [key, value];
			});

			return schema.parse(Object.fromEntries(entries));
		},

		/**
		 * Update URL search parameters and navigate
		 * @param currentUrl - Current URL object
		 * @param updates - Partial updates to apply to search parameters
		 * @param options - Navigation options
		 */
		update: (
			currentUrl: URL,
			updates: Partial<Params>,
			options?: {
				keepFocus?: boolean;
				noScroll?: boolean;
				removeFalsy?: boolean;
			}
		) => {
			const params = new URLSearchParams(currentUrl.searchParams);

			Object.entries(updates).forEach(([key, value]) => {
				if (value === undefined || value === null) {
					params.delete(key);
					return;
				}

				if (value === false && (options?.removeFalsy ?? true)) {
					params.delete(key);
					return;
				}

				// Eksplicitno konvertuj sve tipove u string
				params.set(key, value.toString());
			});

			const url = `${currentUrl.pathname}?${params.toString()}`;
			// @ts-expect-error - Dynamic URL construction for search params navigation
			goto(resolve(url), {
				keepFocus: options?.keepFocus ?? true,
				noScroll: options?.noScroll ?? true
			});
		}
	};
}
