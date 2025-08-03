import { z } from 'zod/v4';

// Define the structure for context schema roles
export const contextSchemaRoleSchema = z.object({
	name: z.string().min(1, 'Role name is required'),
	label: z.string().min(1, 'Role label is required'),
	source_table: z.string().min(1, 'Source table is required')
});

// Define the complete context schema structure
export const contextSchemaStructureSchema = z.object({
	roles: z.array(contextSchemaRoleSchema).min(1, 'At least one role is required')
});

// Generate JSON Schema for client-side validation
export const contextSchemaJSONSchema = z.toJSONSchema(contextSchemaStructureSchema);

// Export types for TypeScript usage
export type ContextSchemaRole = z.infer<typeof contextSchemaRoleSchema>;
export type ContextSchemaStructure = z.infer<typeof contextSchemaStructureSchema>;

// Enhanced schemas for linked table support
export const joinConditionSchema = z.object({
	local_field: z.string().min(1, 'Local field is required'),
	foreign_field: z.string().min(1, 'Foreign field is required')
});

export const whereConditionSchema = z.object({
	field: z.string().min(1, 'Field is required'),
	operator: z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'in']),
	value: z.any()
});

export const orderByClauseSchema = z.object({
	field: z.string().min(1, 'Field is required'),
	direction: z.enum(['asc', 'desc']).default('asc')
});

export const linkedTableDefinitionSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	join_table: z.string().optional(),
	join_conditions: z.array(joinConditionSchema).min(1, 'At least one join condition is required'),
	target_table: z.string().optional(),
	target_join: joinConditionSchema.optional(),
	fields: z.array(z.string()).min(1, 'At least one field is required'),
	where_conditions: z.array(whereConditionSchema).optional(),
	order_by: z.array(orderByClauseSchema).optional()
});

// Enhanced context schema role (extends existing)
export const enhancedContextSchemaRoleSchema = contextSchemaRoleSchema.extend({
	linked_tables: z.array(linkedTableDefinitionSchema).optional()
});

// Enhanced context schema structure
export const enhancedContextSchemaStructureSchema = z.object({
	roles: z.array(enhancedContextSchemaRoleSchema).min(1, 'At least one role is required')
});

// Export enhanced types
export type JoinCondition = z.infer<typeof joinConditionSchema>;
export type WhereCondition = z.infer<typeof whereConditionSchema>;
export type OrderByClause = z.infer<typeof orderByClauseSchema>;
export type LinkedTableDefinition = z.infer<typeof linkedTableDefinitionSchema>;
export type EnhancedContextSchemaRole = z.infer<typeof enhancedContextSchemaRoleSchema>;
export type EnhancedContextSchemaStructure = z.infer<typeof enhancedContextSchemaStructureSchema>;

export const docTemplateInsertSchema = z.object({
	name: z.string().min(3, 'Name must be at least 3 characters'),
	description: z.string().nullable().optional(),
	content: z.string().min(10, 'Template content is required'),
	context_schema: z
		.string()
		.nullable()
		.optional()
		.refine(
			(val) => {
				if (!val || !val.trim()) return true; // Allow empty/null values
				try {
					const parsed = JSON.parse(val);
					contextSchemaStructureSchema.parse(parsed);
					return true;
				} catch {
					return false;
				}
			},
			{
				message:
					'Context schema must be valid JSON matching the expected structure. See the schema definition for details.'
			}
		),
	is_active: z.boolean().default(true)
});

export const docTemplateUpdateSchema = docTemplateInsertSchema.partial();

// New schemas for Generated Documents
export const dataContextSchema = z.record(
	z.string(),
	z.object({
		table: z.string(),
		id: z.number()
	})
);

export const docGeneratedDocumentInsertSchema = z.object({
	doc_template_id: z.number(),
	data_context: dataContextSchema,
	generated_content: z.string().optional().nullable(),
	created_by: z.number().optional().nullable()
});

export const docGeneratedDocumentUpdateSchema = docGeneratedDocumentInsertSchema.partial();
