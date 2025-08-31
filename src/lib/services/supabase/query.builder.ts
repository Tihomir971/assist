import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/supabase';

export type FilterOperator =
	| 'eq'
	| 'neq'
	| 'gt'
	| 'gte'
	| 'lt'
	| 'lte'
	| 'like'
	| 'ilike'
	| 'in'
	| 'cs'
	| 'cd';

export type FilterConfig = {
	field: string;
	operator: FilterOperator;
	value: string | number | boolean | string[] | number[];
};

export type SortConfig = {
	field: string;
	ascending: boolean;
};

// Type for Supabase query builder - using the actual Supabase types
type SupabaseQueryBuilder = ReturnType<SupabaseClient<Database>['from']>;

export class QueryBuilder {
	constructor(private supabase: SupabaseClient<Database>) {}

	apply(
		baseQuery: SupabaseQueryBuilder,
		params: URLSearchParams,
		filterMap: Record<
			string,
			{ field: string; operator: FilterOperator; type?: 'number' | 'boolean' | 'array' }
		> = {},
		sortableFields: string[] = []
	): SupabaseQueryBuilder {
		let query = baseQuery;

		// Apply filters
		for (const [paramName, config] of Object.entries(filterMap)) {
			const paramValue = params.get(paramName);
			if (paramValue !== null && paramValue !== '') {
				let value: string | number | boolean | string[] = paramValue;
				if (config.type === 'number') {
					value = Number(paramValue);
				} else if (config.type === 'boolean') {
					value = paramValue === 'true';
				} else if (config.type === 'array') {
					value = paramValue.split(',');
				} else if (config.operator === 'ilike' || config.operator === 'like') {
					// Add wildcards for text search operations
					value = `%${paramValue}%`;
				}
				query = query[config.operator](config.field, value);
			}
		}

		// Apply sorting
		const sort = params.get('sort');
		const order = params.get('order');
		if (sort && sortableFields.includes(sort)) {
			query = query.order(sort, { ascending: order === 'asc' });
		}

		// Apply pagination
		const page = Number(params.get('page')) || 1;
		const perPage = Number(params.get('perPage')) || 10;
		const from = (page - 1) * perPage;
		const to = from + perPage - 1;
		query = query.range(from, to);

		return query;
	}
}
