import { mAttributeOptionInsertSchema } from '$lib/types/supabase.zod.schemas';
import { columnTypes, createRelatedTableConfig } from '$lib/utils/related-table-config.builder';
import { createFormConfig } from '$lib/utils/form-config.builder';
import { createSplitLayoutConfig, createTabConfig } from '$lib/utils/split-layout-config.builder';
import SmartRelatedTable from '$lib/components/forms/SmartRelatedTable.svelte';
import type { SuperValidated } from 'sveltekit-superforms';
import type { Component } from 'svelte';

const formConfig = createFormConfig()
	.title('Attribute Option')
	.field('name', { label: 'Name', span: 12 })
	.field('code', { label: 'Code', span: 12 })
	.field('sort_order', { label: 'Sort Order', type: 'number', span: 12 })
	.build();

export const attributeOptionsConfig = createRelatedTableConfig()
	.title('Attribute Options')
	.tab({
		tabId: 'options',
		tabLabel: 'Options',
		tabIcon: 'ph:list-numbers'
	})
	.column(columnTypes.text('code', 'Code'))
	.column(columnTypes.text('name', 'Name'))
	.column(columnTypes.number('sort_order', 'Sort Order'))
	.column(columnTypes.boolean('is_active', 'Active'))
	.formSchema(mAttributeOptionInsertSchema)
	.formConfig(formConfig)
	.actions('?/optionUpsert', '?/optionUpsert', '?/optionDelete')
	.parentIdField('attribute_id')
	.build();

export const splitLayoutConfig = createSplitLayoutConfig()
	.leftPanel({ width: '40%' })
	.rightPanel({ width: '60%' })
	.build();

export function createTabConfigs(data: {
	attributeOptions: Record<string, unknown>[];
	formAttributeOptions: SuperValidated<Record<string, unknown>>;
	entity?: { id: number };
}) {
	return [
		createTabConfig(
			'options',
			'Options',
			SmartRelatedTable as Component,
			{
				config: attributeOptionsConfig,
				items: data.attributeOptions,
				validatedForm: data.formAttributeOptions,
				parentId: data.entity?.id
			},
			{
				badge: data.attributeOptions?.length || 0,
				description: 'Manage options for this attribute.'
			}
		)
	];
}
