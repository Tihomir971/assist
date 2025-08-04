import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@tihomir971/assist-shared';
import type { NativeContextSchemaRole } from '$lib/types/supabase.zod.schemas';

/**
 * Native Supabase Query Builder
 *
 * This builder directly translates native Supabase query objects into actual Supabase queries.
 * No custom DSL - just pure Supabase JS syntax that developers already know.
 */
export class NativeSupabaseQueryBuilder {
	constructor(private supabase: SupabaseClient<Database>) {}

	/**
	 * Fetch data for a role using native Supabase query format
	 */
	async fetchRoleData(
		role: NativeContextSchemaRole,
		entityId: number
	): Promise<Record<string, unknown> | Record<string, unknown>[]> {
		try {
			const query = role.query;

			// Build the Supabase query directly from the native query object
			let supabaseQuery = this.supabase
				.from(query.from as keyof Database['public']['Tables'])
				.select(query.select);

			// Apply filters - replace $entityId placeholder with actual entityId
			if (query.eq) {
				const [field, value] = query.eq;
				const actualValue = value === '$entityId' ? entityId : value;
				supabaseQuery = supabaseQuery.eq(field as string, actualValue);
			}

			if (query.neq) {
				const [field, value] = query.neq;
				const actualValue = value === '$entityId' ? entityId : value;
				supabaseQuery = supabaseQuery.neq(field as string, actualValue);
			}

			if (query.gt) {
				const [field, value] = query.gt;
				supabaseQuery = supabaseQuery.gt(field as string, value);
			}

			if (query.gte) {
				const [field, value] = query.gte;
				supabaseQuery = supabaseQuery.gte(field as string, value);
			}

			if (query.lt) {
				const [field, value] = query.lt;
				supabaseQuery = supabaseQuery.lt(field as string, value);
			}

			if (query.lte) {
				const [field, value] = query.lte;
				supabaseQuery = supabaseQuery.lte(field as string, value);
			}

			if (query.like) {
				const [field, pattern] = query.like;
				supabaseQuery = supabaseQuery.like(field, pattern);
			}

			if (query.ilike) {
				const [field, pattern] = query.ilike;
				supabaseQuery = supabaseQuery.ilike(field, pattern);
			}

			if (query.is) {
				const [field, value] = query.is;
				supabaseQuery = supabaseQuery.is(field as string, value as boolean | null);
			}

			if (query.in) {
				const [field, values] = query.in;
				const valueArray = Array.isArray(values) ? values : [values];
				supabaseQuery = supabaseQuery.in(field as string, valueArray as (string | number)[]);
			}

			// Apply ordering
			if (query.order) {
				const orderParts = query.order.split(' ');
				const field = orderParts[0];
				const ascending = orderParts[1]?.toLowerCase() !== 'desc';
				supabaseQuery = supabaseQuery.order(field, { ascending });
			}

			// Apply limit
			if (query.limit) {
				supabaseQuery = supabaseQuery.limit(query.limit);
			}

			// Apply range
			if (query.range) {
				const [from, to] = query.range;
				supabaseQuery = supabaseQuery.range(from, to);
			}

			// Handle nested filtering (e.g., "c_bpartner_location.eq": ["is_active", true])
			Object.entries(query).forEach(([key, value]) => {
				if (key.includes('.') && Array.isArray(value) && value.length === 2) {
					const [tableName, operation] = key.split('.');
					const [field, filterValue] = value;

					// Apply nested filters using Supabase's nested filtering syntax
					switch (operation) {
						case 'eq':
							supabaseQuery = supabaseQuery.eq(`${tableName}.${field}`, filterValue);
							break;
						case 'neq':
							supabaseQuery = supabaseQuery.neq(`${tableName}.${field}`, filterValue);
							break;
						case 'gt':
							supabaseQuery = supabaseQuery.gt(`${tableName}.${field}`, filterValue);
							break;
						case 'gte':
							supabaseQuery = supabaseQuery.gte(`${tableName}.${field}`, filterValue);
							break;
						case 'lt':
							supabaseQuery = supabaseQuery.lt(`${tableName}.${field}`, filterValue);
							break;
						case 'lte':
							supabaseQuery = supabaseQuery.lte(`${tableName}.${field}`, filterValue);
							break;
						case 'like':
							supabaseQuery = supabaseQuery.like(`${tableName}.${field}`, filterValue);
							break;
						case 'ilike':
							supabaseQuery = supabaseQuery.ilike(`${tableName}.${field}`, filterValue);
							break;
						case 'is':
							supabaseQuery = supabaseQuery.is(`${tableName}.${field}`, filterValue);
							break;
						case 'in': {
							const valueArray = Array.isArray(filterValue) ? filterValue : [filterValue];
							supabaseQuery = supabaseQuery.in(`${tableName}.${field}`, valueArray);
							break;
						}
					}
				} else if (key.includes('.') && typeof value === 'string' && key.endsWith('.order')) {
					// Handle nested ordering (e.g., "c_bpartner_location.order": "name")
					const tableName = key.replace('.order', '');
					const orderParts = value.split(' ');
					const field = orderParts[0];
					const ascending = orderParts[1]?.toLowerCase() !== 'desc';
					supabaseQuery = supabaseQuery.order(field, {
						ascending,
						foreignTable: tableName
					});
				}
			});

			const { data, error } = await supabaseQuery;

			if (error) {
				console.error(`Error executing native query for role ${role.name}:`, error);
				throw new Error(`Query failed: ${error.message}`);
			}

			// Debug logging to help troubleshoot data structure
			console.log(
				`[NativeSupabaseQueryBuilder] Role: ${role.name}, Data:`,
				JSON.stringify(data, null, 2)
			);

			// For single record queries, return the first record directly
			// For array queries, return the array
			if (Array.isArray(data)) {
				// If we have exactly one result and no explicit limit/range, return the single object
				// This allows template variables like {{customer.display_name}} to work
				if (data.length === 1 && !query.limit && !query.range) {
					console.log(
						`[NativeSupabaseQueryBuilder] Returning single object for role: ${role.name}`
					);
					return (data[0] as unknown as Record<string, unknown>) || {};
				}
				// Otherwise return the full array
				console.log(
					`[NativeSupabaseQueryBuilder] Returning array for role: ${role.name}, length: ${data.length}`
				);
				return data as unknown as Record<string, unknown>[];
			}

			return (data as unknown as Record<string, unknown>) || {};
		} catch (error) {
			console.error(`Error in fetchRoleData for ${role.name}:`, error);
			throw error;
		}
	}

	/**
	 * Execute a raw native Supabase query
	 * This method provides direct access to the Supabase client for complex queries
	 */
	async executeRawQuery(
		tableName: string,
		selectClause: string,
		filters?: Record<string, unknown>,
		entityId?: number
	): Promise<unknown> {
		try {
			let query = this.supabase
				.from(tableName as keyof Database['public']['Tables'])
				.select(selectClause);

			// Apply filters if provided
			if (filters) {
				Object.entries(filters).forEach(([key, value]) => {
					if (key.startsWith('eq.')) {
						const field = key.substring(3);
						const actualValue = value === '$entityId' ? entityId : value;
						query = query.eq(field as string, actualValue as string | number | boolean);
					} else if (key.startsWith('neq.')) {
						const field = key.substring(4);
						const actualValue = value === '$entityId' ? entityId : value;
						query = query.neq(field as string, actualValue as string | number | boolean);
					} else if (key.startsWith('gt.')) {
						const field = key.substring(3);
						query = query.gt(field as string, value as string | number);
					} else if (key.startsWith('gte.')) {
						const field = key.substring(4);
						query = query.gte(field as string, value as string | number);
					} else if (key.startsWith('lt.')) {
						const field = key.substring(3);
						query = query.lt(field as string, value as string | number);
					} else if (key.startsWith('lte.')) {
						const field = key.substring(4);
						query = query.lte(field as string, value as string | number);
					} else if (key.startsWith('like.')) {
						const field = key.substring(5);
						query = query.like(field as string, value as string);
					} else if (key.startsWith('ilike.')) {
						const field = key.substring(6);
						query = query.ilike(field as string, value as string);
					} else if (key.startsWith('is.')) {
						const field = key.substring(3);
						query = query.is(field as string, value as boolean | null);
					} else if (key.startsWith('in.')) {
						const field = key.substring(3);
						const valueArray = Array.isArray(value) ? value : [value];
						query = query.in(field as string, valueArray as (string | number)[]);
					} else if (key === 'order') {
						const orderParts = (value as string).split(' ');
						const field = orderParts[0];
						const ascending = orderParts[1]?.toLowerCase() !== 'desc';
						query = query.order(field as string, { ascending });
					} else if (key === 'limit') {
						query = query.limit(value as number);
					} else if (key === 'range') {
						const [from, to] = value as [number, number];
						query = query.range(from, to);
					}
				});
			}

			const { data, error } = await query;

			if (error) {
				console.error('Error executing raw query:', error);
				throw new Error(`Raw query failed: ${error.message}`);
			}

			return data;
		} catch (error) {
			console.error('Error in executeRawQuery:', error);
			throw error;
		}
	}
}
