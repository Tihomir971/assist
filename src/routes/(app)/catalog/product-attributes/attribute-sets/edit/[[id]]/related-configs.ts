import { mAttributesetAttributeInsertSchema } from '@tihomir971/assist-shared';
import { columnTypes, createRelatedTableConfig } from '$lib/utils/related-table-config.builder';
import { createFormConfig } from '$lib/utils/form-config.builder';
import { createSplitLayoutConfig, createTabConfig } from '$lib/utils/split-layout-config.builder';
import SmartRelatedTable from '$lib/components/forms/SmartRelatedTable.svelte';
import type { SuperValidated } from 'sveltekit-superforms';
import type { Component } from 'svelte';
import { invalidate } from '$app/navigation';

const formConfig = createFormConfig()
	.title('Attribute Set Attribute')
	.fieldTyped('attribute_id', {
		label: 'Attribute',
		type: 'select',
		span: 12
	})
	.fieldTyped('sequence', {
		label: 'Sequence',
		type: 'number',
		span: 6
	})
	.fieldTyped('is_required', {
		label: 'Mandatory',
		type: 'boolean',
		span: 3
	})
	.fieldTyped('is_searchable', {
		label: 'Searchable',
		type: 'boolean',
		span: 3
	})
	.fieldTyped('is_active', {
		label: 'Active',
		type: 'boolean',
		span: 3
	})
	.build();

export const attributeSetAttributesConfig = createRelatedTableConfig()
	.title('Attributes in Set')
	.tab({
		tabId: 'attributes',
		tabLabel: 'Attributes',
		tabIcon: 'ph:list',
		tabOrder: 1,
		tabBadgeKey: 'count',
		tabDescription: 'Manage attributes that belong to this attribute set'
	})
	.column(columnTypes.lookup('attribute_id', 'Attribute', 'attributes'))
	.column(columnTypes.number('sequence', 'Sequence'))
	.column(columnTypes.boolean('is_required', 'Mandatory'))
	.column(columnTypes.boolean('is_searchable', 'Searchable'))
	.column(columnTypes.boolean('is_active', 'Active'))
	.formSchema(mAttributesetAttributeInsertSchema)
	.formConfig(formConfig)
	.actions('?/attributeUpsert', '?/attributeUpsert', '?/attributeDelete')
	.parentIdField('attributeset_id')
	.build();

// Split layout configuration
export const splitLayoutConfig = createSplitLayoutConfig()
	.leftPanel({
		title: 'Attribute Set Details',
		width: '45%',
		minWidth: '400px'
	})
	.rightPanel({
		title: 'Related Data',
		width: '55%',
		minWidth: '500px'
	})
	.responsive({
		breakpoint: '768px',
		stackOrder: 'form-first'
	})
	.build();

// Tab configurations helper function
export function createTabConfigs(data: {
	attributeSetAttributes: Record<string, unknown>[];
	formAttributeSetAttributes: SuperValidated<Record<string, unknown>>;
	entity?: { id: number };
	attributes: Array<{ value: number; label: string }>;
}) {
	// Refresh handler to reload data after operations
	const handleRefresh = () => {
		invalidate('catalog:attribute-sets');
	};

	return [
		createTabConfig(
			'attributes',
			'Attributes',
			SmartRelatedTable as Component,
			{
				config: attributeSetAttributesConfig,
				items: data.attributeSetAttributes,
				validatedForm: data.formAttributeSetAttributes,
				parentId: data.entity?.id,
				lookupData: { attributes: data.attributes },
				onRefresh: handleRefresh
			},
			{
				badge: data.attributeSetAttributes?.length || 0,
				description: 'Manage attributes that belong to this attribute set'
			}
		)
		// Additional tabs can be added here for future related tables
	];
}
