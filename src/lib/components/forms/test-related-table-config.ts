import { createRelatedTableConfig, columnTypes } from '$lib/utils/related-table-config.builder';
import { createFormConfig } from '$lib/utils/form-config.builder';
import { z } from 'zod';

// Test schema for demonstration
const testSchema = z.object({
	id: z.number().optional(),
	name: z.string().min(1, 'Name is required'),
	description: z.string().optional(),
	is_active: z.boolean().default(true),
	created_at: z.string().optional(),
	parent_id: z.number().optional()
});

type TestEntity = z.infer<typeof testSchema>;

// Simple test configuration to verify Phase 1 implementation
export const testRelatedTableConfig = createRelatedTableConfig<TestEntity, typeof testSchema>()
	.title('Test Related Table')
	.description('Simple test configuration for Smart Related Table')
	.column(columnTypes.text('name', 'Name'))
	.column(columnTypes.text('description', 'Description'))
	.column(columnTypes.boolean('is_active', 'Active', { width: '80px' }))
	.formSchema(testSchema)
	.formConfig(
		createFormConfig<TestEntity>()
			.title('Test Entity Details')
			.field('name', {
				span: 6,
				placeholder: 'Enter name'
			})
			.field('description', {
				span: 12,
				placeholder: 'Enter description'
			})
			.field('is_active', {
				span: 6,
				label: 'Active'
			})
			.build()
	)
	.actions('?/create', '?/update', '?/delete')
	.permissions(true, true, false) // can create, can edit, cannot delete (simplified)
	.parentIdField('parent_id')
	.cardProps({
		className: 'col-span-2',
		showHeader: true
	})
	.build();

// Export the configuration for testing
export { testSchema };
export type { TestEntity };
