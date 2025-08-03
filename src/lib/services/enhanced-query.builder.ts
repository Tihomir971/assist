import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@tihomir971/assist-shared';
import type {
	EnhancedContextSchemaRole,
	LinkedTableDefinition,
	WhereCondition
} from '$lib/types/supabase.zod.schemas';

export class EnhancedQueryBuilder {
	constructor(private supabase: SupabaseClient<Database>) {}

	/**
	 * Build and execute a complex query with joins based on role definition
	 */
	async fetchRoleData(
		role: EnhancedContextSchemaRole,
		entityId: number
	): Promise<Record<string, unknown>> {
		// Fetch main entity data
		const mainData = await this.fetchMainEntity(role.source_table, entityId);
		if (!mainData) {
			throw new Error(`Entity not found in ${role.source_table} with id ${entityId}`);
		}

		const result: Record<string, unknown> = { ...mainData };

		// Fetch linked table data if defined
		if (role.linked_tables) {
			for (const linkedTable of role.linked_tables) {
				const linkedData = await this.fetchLinkedTableData(
					role.source_table,
					entityId,
					linkedTable
				);
				result[linkedTable.name] = linkedData;
			}
		}

		return result;
	}

	/**
	 * Fetch main entity data
	 */
	private async fetchMainEntity(
		tableName: string,
		entityId: number
	): Promise<Record<string, unknown> | null> {
		const { data, error } = await this.supabase
			.from(tableName as keyof Database['public']['Tables'])
			.select('*')
			.eq('id', entityId)
			.single();

		if (error) {
			console.error(`Error fetching main entity from ${tableName}:`, error);
			return null;
		}

		return data;
	}

	/**
	 * Fetch linked table data with complex joins
	 * For the customer locations example, this will:
	 * 1. Query c_bpartner_location where c_bpartner_id = entityId
	 * 2. Join with l_location using l_location_id
	 * 3. Return combined data
	 */
	private async fetchLinkedTableData(
		sourceTable: string,
		entityId: number,
		linkedTable: LinkedTableDefinition
	): Promise<unknown[]> {
		try {
			if (linkedTable.join_table && linkedTable.target_table && linkedTable.target_join) {
				// Complex join: use two-step approach to avoid Supabase join issues
				return await this.fetchComplexJoinData(entityId, linkedTable);
			} else {
				// Simple case: just select from one table
				return await this.fetchSimpleTableData(entityId, linkedTable);
			}
		} catch (error) {
			console.error(`Error in fetchLinkedTableData for ${linkedTable.name}:`, error);
			return [];
		}
	}

	/**
	 * Fetch data using a two-step approach for complex joins
	 * This avoids Supabase's complex join syntax issues
	 */
	private async fetchComplexJoinData(
		entityId: number,
		linkedTable: LinkedTableDefinition
	): Promise<unknown[]> {
		// Step 1: Get join table data (e.g., c_bpartner_location)
		// Extract fields that don't have dot notation (these come from join table)
		const joinFields = linkedTable.fields.filter((field) => !field.includes('.'));
		const joinFieldsToSelect = joinFields.length > 0 ? ['*', ...joinFields] : ['*'];

		let joinQuery = this.supabase
			.from(linkedTable.join_table as keyof Database['public']['Tables'])
			.select(joinFieldsToSelect.join(', '));

		// Apply join conditions to link to source entity
		for (const joinCondition of linkedTable.join_conditions) {
			if (joinCondition.local_field === 'id') {
				joinQuery = joinQuery.eq(joinCondition.foreign_field, entityId);
			}
		}

		// Apply where conditions
		if (linkedTable.where_conditions) {
			for (const whereCondition of linkedTable.where_conditions) {
				joinQuery = this.applyWhereCondition(joinQuery, whereCondition);
			}
		}

		// Apply ordering
		if (linkedTable.order_by) {
			for (const orderBy of linkedTable.order_by) {
				joinQuery = joinQuery.order(orderBy.field, { ascending: orderBy.direction === 'asc' });
			}
		}

		const { data: joinData, error: joinError } = await joinQuery;

		if (joinError) {
			console.error(`Error fetching join table data:`, joinError);
			return [];
		}

		if (!joinData || joinData.length === 0) {
			return [];
		}

		// Step 2: Get target table data (e.g., l_location) for each join record
		const targetIds = joinData
			.map(
				(record) =>
					(record as unknown as Record<string, unknown>)[linkedTable.target_join!.local_field]
			)
			.filter(Boolean);

		if (targetIds.length === 0) {
			return joinData; // Return join data without target data
		}

		// Extract fields with dot notation and remove the table prefix
		const targetFields = linkedTable.fields
			.filter((field) => field.includes('.'))
			.map((field) => field.split('.')[1]); // Remove table prefix

		// Ensure the foreign key field is included in the select fields for proper mapping
		const selectFields = [...targetFields];
		const foreignKeyField = linkedTable.target_join!.foreign_field;
		if (!selectFields.includes(foreignKeyField)) {
			selectFields.push(foreignKeyField);
		}

		const { data: targetData, error: targetError } = await this.supabase
			.from(linkedTable.target_table as keyof Database['public']['Tables'])
			.select(selectFields.join(', '))
			.in(foreignKeyField, targetIds);

		if (targetError) {
			console.error(`Error fetching target table data:`, targetError);
			return joinData; // Return join data without target data
		}

		// Step 3: Merge the data
		const targetMap = new Map(
			(targetData || []).map((record) => [
				(record as unknown as Record<string, unknown>)[linkedTable.target_join!.foreign_field],
				record
			])
		);

		const result = joinData.map((joinRecord) => {
			const joinRecordTyped = joinRecord as unknown as Record<string, unknown>;
			const targetId = joinRecordTyped[linkedTable.target_join!.local_field];
			const targetRecord = targetMap.get(targetId);

			return {
				...joinRecordTyped,
				[linkedTable.target_table!]: targetRecord || null
			};
		});

		return result;
	}

	/**
	 * Fetch data from a single table (simple case)
	 */
	private async fetchSimpleTableData(
		entityId: number,
		linkedTable: LinkedTableDefinition
	): Promise<unknown[]> {
		const queryTable = linkedTable.join_table || linkedTable.target_table;
		const selectClause = linkedTable.fields.join(', ');

		let query = this.supabase
			.from(queryTable as keyof Database['public']['Tables'])
			.select(selectClause);

		// Apply join conditions to link to source entity
		for (const joinCondition of linkedTable.join_conditions) {
			if (joinCondition.local_field === 'id') {
				query = query.eq(joinCondition.foreign_field, entityId);
			}
		}

		// Apply where conditions
		if (linkedTable.where_conditions) {
			for (const whereCondition of linkedTable.where_conditions) {
				query = this.applyWhereCondition(query, whereCondition);
			}
		}

		// Apply ordering
		if (linkedTable.order_by) {
			for (const orderBy of linkedTable.order_by) {
				query = query.order(orderBy.field, { ascending: orderBy.direction === 'asc' });
			}
		}

		const { data, error } = await query;

		if (error) {
			console.error(`Error fetching simple table data:`, error);
			return [];
		}

		return data || [];
	}

	/**
	 * Apply where condition to query
	 */
	private applyWhereCondition(
		query: ReturnType<SupabaseClient<Database>['from']>,
		condition: WhereCondition
	): ReturnType<SupabaseClient<Database>['from']> {
		switch (condition.operator) {
			case 'eq':
				return query.eq(condition.field, condition.value);
			case 'neq':
				return query.neq(condition.field, condition.value);
			case 'gt':
				return query.gt(condition.field, condition.value);
			case 'gte':
				return query.gte(condition.field, condition.value);
			case 'lt':
				return query.lt(condition.field, condition.value);
			case 'lte':
				return query.lte(condition.field, condition.value);
			case 'like':
				return query.like(condition.field, condition.value);
			case 'in':
				return query.in(condition.field, condition.value);
			default:
				return query;
		}
	}
}
