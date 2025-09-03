import { error, fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { zod4 } from 'sveltekit-superforms/adapters';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/supabase';
import { QueryBuilder, type FilterOperator } from '$lib/services/supabase/query.builder';
import type { DataTableConfig, SelectFilterOption } from './data-table-config.builder';
import { extractStructuredSupabaseError } from '$lib/server/utils/supabase-error.utils';
import { deleteByIdSchema } from '$lib/types/zod-delete-by-id';

type ServiceWithDelete = {
	delete(id: number): Promise<void>;
};

type ServiceConstructor<TService> = new (supabase: SupabaseClient<Database>) => TService;

export function createListPageLoader<TData, TService extends ServiceWithDelete>(options: {
	config: DataTableConfig<TData>;
	baseQuery: (supabase: SupabaseClient<Database>) => ReturnType<SupabaseClient<Database>['from']>;
	service: ServiceConstructor<TService>;
	lookupData?: Record<string, (service: TService) => Promise<SelectFilterOption[]>>;
}) {
	const { config, baseQuery, service: Service, lookupData } = options;

	const loader = async ({
		url,
		locals: { supabase }
	}: {
		url: URL;
		locals: { supabase: SupabaseClient<Database> };
	}) => {
		const queryBuilder = new QueryBuilder(supabase);
		const deleteForm = await superValidate(zod4(deleteByIdSchema));
		const searchParams = url.searchParams;

		let items: TData[] = [];
		let count = 0;
		let page = 1;
		let perPage = 10;
		const lookup: Record<string, SelectFilterOption[]> = {};

		if (config.mode === 'client') {
			// Fetch all data for client-side processing
			// Supabase's default limit is 1000. We override it here for client-side tables.
			// Adjust this limit if you expect more than 10,000 records.
			const { data, error: queryError } = await baseQuery(supabase).limit(10000);
			if (queryError) {
				console.error('Error fetching data for client mode:', queryError);
				throw error(500, 'Error fetching data');
			}
			items = data || [];
			count = items.length;
		} else {
			// Server-side processing

			// Prepare filter map for QueryBuilder
			const filterMap: Record<
				string,
				{ field: string; operator: FilterOperator; type?: 'number' | 'boolean' | 'array' }
			> = {};
			config.filters.forEach((filter) => {
				if (filter.field && filter.operator) {
					filterMap[filter.name] = {
						field: filter.field,
						operator: filter.operator,
						type: filter.dbType
					};
				}
			});

			// Prepare sortable fields
			const sortableFields = config.columns
				.map((col) => ('accessorKey' in col ? col.accessorKey : null))
				.filter(Boolean) as string[];

			const enhancedQuery = queryBuilder.apply(
				baseQuery(supabase),
				searchParams,
				filterMap,
				sortableFields
			);

			const { data, error: queryError, count: totalCount } = await enhancedQuery;

			if (queryError) {
				console.error('Error fetching data for server mode:', queryError);
				throw error(500, 'Error fetching data');
			}

			items = data || [];
			count = totalCount || 0;
			page = Number(searchParams.get('page')) || 1;
			perPage = Number(searchParams.get('perPage')) || 10;
		}

		// Fetch lookup data if provided
		if (lookupData) {
			const serviceInstance = new Service(supabase);
			for (const key in lookupData) {
				if (Object.prototype.hasOwnProperty.call(lookupData, key)) {
					lookup[key] = await lookupData[key](serviceInstance);
				}
			}
		}

		return {
			items,
			count,
			page,
			perPage,
			deleteForm,
			lookup
		};
	};

	const actions = {
		delete: async ({
			request,
			locals: { supabase }
		}: {
			request: Request;
			locals: { supabase: SupabaseClient<Database> };
		}) => {
			const form = await superValidate(request, zod4(deleteByIdSchema));
			if (!form.valid) return fail(400, { form });

			const serviceInstance = new Service(supabase);
			// Assuming the service has a delete method
			if ('delete' in serviceInstance && typeof serviceInstance.delete === 'function') {
				try {
					await serviceInstance.delete(Number(form.data.id));
					return { form, success: true, operation: 'delete' };
				} catch (err) {
					// Extract structured error information for delete operations
					const structuredError = extractStructuredSupabaseError(err, 'delete', 'item');

					return fail(500, {
						form,
						error: structuredError.details,
						errorTitle: structuredError.title,
						errorConstraint: structuredError.constraint,
						errorSuggestion: structuredError.suggestion,
						errorCode: structuredError.code,
						isStructuredError: structuredError.isStructured,
						errorType: 'server',
						operation: 'delete'
					});
				}
			} else {
				return fail(500, {
					form,
					error: 'Delete method not available on service.',
					errorTitle: 'Configuration Error',
					errorSuggestion: 'Please contact your administrator.',
					isStructuredError: false,
					errorType: 'configuration',
					operation: 'delete'
				});
			}
		}
	};

	return { load: loader, actions };
}
