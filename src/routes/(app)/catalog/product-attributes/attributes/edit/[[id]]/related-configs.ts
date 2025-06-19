import { mAttributeOptionInsertSchema } from '$lib/types/supabase.zod.schemas';
import { columnTypes, createRelatedTableConfig } from '$lib/utils/related-table-config.builder';
import { createFormConfig } from '$lib/utils/form-config.builder';

const formConfig = createFormConfig()
	.title('Attribute Option')
	.field('name', { label: 'Name', span: 12 })
	.field('code', { label: 'Code', span: 12 })
	.field('sort_order', { label: 'Sort Order', type: 'number', span: 12 })
	.build();

export const attributeOptionsConfig = createRelatedTableConfig()
	.title('Attribute Options')
	.column(columnTypes.text('code', 'Code'))
	.column(columnTypes.text('name', 'Name'))
	.column(columnTypes.number('sort_order', 'Sort Order'))
	.column(columnTypes.boolean('is_active', 'Active'))
	.formSchema(mAttributeOptionInsertSchema)
	.formConfig(formConfig)
	.actions('?/optionUpsert', '?/optionUpsert', '?/optionDelete')
	.parentIdField('attribute_id')
	.build();
