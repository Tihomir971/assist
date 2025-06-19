import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/supabase.types';

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

export class QueryBuilder<T> {
	constructor(private supabase: SupabaseClient<Database>) {}

	apply(
		baseQuery: any, // SupabasePostgrestQueryBuilder<any, any, T>,
		params: URLSearchParams,
		filterMap: Record<
			string,
			{ field: string; operator: FilterOperator; type?: 'number' | 'boolean' | 'array' }
		> = {},
		sortableFields: string[] = []
	) {
		let query = baseQuery;

		// Apply filters
		for (const [paramName, config] of Object.entries(filterMap)) {
			const paramValue = params.get(paramName);
			if (paramValue !== null && paramValue !== '') {
				let value: any = paramValue;
				if (config.type === 'number') {
					value = Number(paramValue);
				} else if (config.type === 'boolean') {
					value = paramValue === 'true';
				} else if (config.type === 'array') {
					value = paramValue.split(',');
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
