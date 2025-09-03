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
export type ContextSchemaStructure = z.infer<typeof contextSchemaStructureSchema>;

// Native Supabase JS query format - much simpler and more intuitive
export const nativeSupabaseQuerySchema = z
	.object({
		from: z.string().min(1, 'Table name is required'),
		select: z.string().min(1, 'Select clause is required'),
		eq: z.array(z.union([z.string(), z.number(), z.boolean()])).optional(),
		neq: z.array(z.union([z.string(), z.number(), z.boolean()])).optional(),
		gt: z.array(z.union([z.string(), z.number()])).optional(),
		gte: z.array(z.union([z.string(), z.number()])).optional(),
		lt: z.array(z.union([z.string(), z.number()])).optional(),
		lte: z.array(z.union([z.string(), z.number()])).optional(),
		like: z.array(z.string()).optional(),
		ilike: z.array(z.string()).optional(),
		is: z.array(z.union([z.string(), z.null()])).optional(),
		in: z.array(z.union([z.string(), z.array(z.union([z.string(), z.number()]))])).optional(),
		order: z.string().optional(),
		limit: z.number().optional(),
		range: z.array(z.number()).optional()
	})
	.catchall(z.any()); // Allow additional properties for nested filtering like "table.eq"

// Native context schema role - uses direct Supabase queries
export const nativeContextSchemaRoleSchema = z.object({
	name: z.string().min(1, 'Role name is required'),
	label: z.string().min(1, 'Role label is required'),
	query: nativeSupabaseQuerySchema
});

// Native context schema structure
export const nativeContextSchemaStructureSchema = z.object({
	roles: z.array(nativeContextSchemaRoleSchema).min(1, 'At least one role is required')
});

// Export native types
export type NativeContextSchemaRole = z.infer<typeof nativeContextSchemaRoleSchema>;
export type NativeContextSchemaStructure = z.infer<typeof nativeContextSchemaStructureSchema>;

// Keep backward compatibility types (deprecated)
export type LinkedTableDefinition = {
	name: string;
	from: string;
	join_on: string;
	to?: string;
	to_key?: string;
	fields: string[];
	where?: string;
	order?: string;
};
export type EnhancedContextSchemaRole = {
	name: string;
	label: string;
	source_table: string;
	linked_tables?: LinkedTableDefinition[];
};
export type EnhancedContextSchemaStructure = {
	roles: EnhancedContextSchemaRole[];
};

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
					nativeContextSchemaStructureSchema.parse(parsed);
					return true;
				} catch {
					return false;
				}
			},
			{
				message:
					'Context schema must be valid JSON using the native Supabase JS query format. See the schema examples for details.'
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
