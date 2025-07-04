import { createRelatedTableConfig, columnTypes } from '$lib/utils/related-table-config.builder';
import { createFormConfig } from '$lib/utils/form-config.builder';
import { cChannelMapCategoryInsertSchema } from '@tihomir971/assist-shared';
import type { CChannelMapCategoryInsert, MProductCategoryRow } from '@tihomir971/assist-shared';
import type { Tables } from '@tihomir971/assist-shared';
import { createSplitLayoutConfig, createTabConfig } from '$lib/utils/split-layout-config.builder';
import SmartRelatedTable from '$lib/components/forms/SmartRelatedTable.svelte';
import type { Component } from 'svelte';
import type { SuperValidated } from 'sveltekit-superforms';
import { invalidate } from '$app/navigation';

// Channel Mapping Configuration
export const channelMappingConfig = createRelatedTableConfig<
	Tables<'c_channel_map_category'>,
	typeof cChannelMapCategoryInsertSchema
>()
	.title('Channel Mappings')
	.description('Manage category mappings across different channels')
	.tab({
		tabId: 'channel-mappings',
		tabLabel: 'Channels',
		tabIcon: 'ph:broadcast'
	})
	.column(columnTypes.lookup('c_channel_id', 'Channel', 'c_channels', { width: '150px' }))
	.column(columnTypes.text('resource_id', 'Resource ID'))
	.column(columnTypes.text('resource_name', 'Description'))
	.column(columnTypes.boolean('is_active', 'Active', { width: '80px' }))
	.formSchema(cChannelMapCategoryInsertSchema)
	.formConfig(
		createFormConfig<CChannelMapCategoryInsert>()
			.title('Channel Mapping')
			.field('c_channel_id', {
				span: 6,
				label: 'Channel',
				type: 'combobox',
				searchable: true,
				placeholder: 'Select channel'
			})
			.field('resource_id', {
				label: 'Resource ID',
				span: 3,
				placeholder: 'Enter resource ID'
			})
			.field('is_active', {
				span: 3,
				label: 'Active'
			})
			.field('resource_name', {
				span: 12,
				placeholder: 'Enter description'
			})

			.field('created_at', {
				type: 'datetime',
				span: 6,
				label: 'Created at'
			})
			.field('updated_at', {
				type: 'datetime',
				span: 6,
				label: 'Updated at'
			})
			.build()
	)
	.actions('?/channelMapUpsert', '?/channelMapUpsert', '?/channelMapDelete')
	.parentIdField('m_product_category_id')
	.build();

export const splitLayoutConfig = createSplitLayoutConfig()
	.leftPanel({ width: '45%' })
	.rightPanel({ width: '55%' })
	.build();

// Helper function to dynamically create tab configurations
export function createTabConfigs(data: {
	channelMapCategory: Record<string, unknown>[];
	formChannel: SuperValidated<Record<string, unknown>>;
	category: MProductCategoryRow | null;
	c_channels: Array<{ value: number; label: string }>;
}) {
	// Refresh handler to reload data after operations
	const handleRefresh = () => {
		invalidate('app:category-page');
	};

	return [
		createTabConfig(
			'channel-mappings',
			'Channels',
			SmartRelatedTable as Component,
			{
				config: channelMappingConfig,
				items: data.channelMapCategory,
				validatedForm: data.formChannel,
				parentId: data.category?.id,
				lookupData: { c_channels: data.c_channels },
				onRefresh: handleRefresh
			},
			{
				badge: data.channelMapCategory?.length || 0,
				description: 'Manage channel mappings for this category'
			}
		)
	];
}
