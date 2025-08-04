import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@tihomir971/assist-shared';
import type {
	EnhancedContextSchemaRole,
	LinkedTableDefinition
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
				// Debug: Log the raw linkedTable object from database
				console.log(
					`DEBUG: Raw linkedTable object for ${linkedTable.name}:`,
					JSON.stringify(linkedTable, null, 2)
				);

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
			// Check if we have fields with dot notation (indicating target table fields)
			const hasTargetFields = linkedTable.fields.some((field) => field.includes('.'));

			if (linkedTable.from && linkedTable.to && linkedTable.to_key && hasTargetFields) {
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
			.from(linkedTable.from as keyof Database['public']['Tables'])
			.select(joinFieldsToSelect.join(', '));

		// Apply join condition to link to source entity (simplified)
		joinQuery = joinQuery.eq(linkedTable.join_on, entityId);

		// Apply where condition (simplified string format)
		if (linkedTable.where) {
			// Parse simple where conditions like "is_active = true"
			const whereMatch = linkedTable.where.match(/(\w+)\s*=\s*(.+)/);
			if (whereMatch) {
				const [, field, value] = whereMatch;
				const parsedValue =
					value === 'true'
						? true
						: value === 'false'
							? false
							: !isNaN(Number(value))
								? Number(value)
								: value.replace(/['"]/g, '');
				joinQuery = joinQuery.eq(field, parsedValue);
			}
		}

		// Apply ordering (simplified string format)
		if (linkedTable.order) {
			const isDesc = linkedTable.order.toLowerCase().includes('desc');
			const field = linkedTable.order.replace(/\s+(asc|desc)$/i, '').trim();
			joinQuery = joinQuery.order(field, { ascending: !isDesc });
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
			.map((record) => (record as unknown as Record<string, unknown>)[linkedTable.to_key!])
			.filter(Boolean);

		if (targetIds.length === 0) {
			// No target IDs found, but still create the expected structure with null target data
			return joinData.map((joinRecord) => ({
				...(joinRecord as unknown as Record<string, unknown>),
				[linkedTable.to!]: null
			}));
		}

		// Extract fields with dot notation and remove the table prefix
		const targetFields = linkedTable.fields
			.filter((field) => field.includes('.'))
			.map((field) => field.split('.')[1]); // Remove table prefix

		// Ensure the foreign key field is included in the select fields for proper mapping
		const selectFields = [...targetFields];
		const foreignKeyField = 'id'; // Always 'id' in simplified schema
		if (!selectFields.includes(foreignKeyField)) {
			selectFields.push(foreignKeyField);
		}

		const { data: targetData, error: targetError } = await this.supabase
			.from(linkedTable.to as keyof Database['public']['Tables'])
			.select(selectFields.join(', '))
			.in(foreignKeyField, targetIds);

		if (targetError) {
			console.error(`Error fetching target table data:`, targetError);
			return joinData; // Return join data without target data
		}

		// Step 3: Merge the data
		const targetMap = new Map(
			(targetData || []).map((record) => [
				(record as unknown as Record<string, unknown>)[foreignKeyField],
				record
			])
		);

		const result = joinData.map((joinRecord) => {
			const joinRecordTyped = joinRecord as unknown as Record<string, unknown>;
			const targetId = joinRecordTyped[linkedTable.to_key!];
			const targetRecord = targetMap.get(targetId);

			return {
				...joinRecordTyped,
				[linkedTable.to!]: targetRecord || null
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
		// For simple queries, we should use the 'from' table (join table)
		const queryTable = linkedTable.from;

		if (!queryTable) {
			console.error('No table specified for simple query');
			return [];
		}

		// Filter out dot notation fields for simple queries (they can't be handled here)
		const simpleFields = linkedTable.fields.filter((field) => !field.includes('.'));
		const selectClause = simpleFields.length > 0 ? simpleFields.join(', ') : '*';

		let query = this.supabase
			.from(queryTable as keyof Database['public']['Tables'])
			.select(selectClause);

		// Apply join condition to link to source entity (simplified)
		query = query.eq(linkedTable.join_on, entityId);

		// Apply where condition (simplified string format)
		if (linkedTable.where) {
			const whereMatch = linkedTable.where.match(/(\w+)\s*=\s*(.+)/);
			if (whereMatch) {
				const [, field, value] = whereMatch;
				const parsedValue =
					value === 'true'
						? true
						: value === 'false'
							? false
							: !isNaN(Number(value))
								? Number(value)
								: value.replace(/['"]/g, '');
				query = query.eq(field, parsedValue);
			}
		}

		// Apply ordering (simplified string format)
		if (linkedTable.order) {
			const isDesc = linkedTable.order.toLowerCase().includes('desc');
			const field = linkedTable.order.replace(/\s+(asc|desc)$/i, '').trim();
			query = query.order(field, { ascending: !isDesc });
		}

		const { data, error } = await query;

		if (error) {
			console.error(`Error fetching simple table data:`, error);
			return [];
		}

		return data || [];
	}
}
