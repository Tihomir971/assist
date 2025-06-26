import { createRelatedTableConfig, columnTypes } from '$lib/utils/related-table-config.builder';
import { createFormConfig } from '$lib/utils/form-config.builder';
import {
	cChannelMapCategoryInsertSchema,
	priceRulesInsertSchema
} from '$lib/types/supabase.zod.schemas';
import type {
	CChannelMapCategoryInsert,
	PriceRulesInsert,
	MProductCategoryRow
} from '$lib/types/supabase.zod.schemas.d';
import type { Tables } from '$lib/types/supabase.types';
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

// Price Rules Configuration
export const priceRulesConfig = createRelatedTableConfig<
	Tables<'price_rules'>,
	typeof priceRulesInsertSchema
>()
	.title('Price Rules')
	.description('Configure pricing rules for this category')
	.tab({
		tabId: 'price-rules',
		tabLabel: 'Price Rules',
		tabIcon: 'ph:tag'
	})
	.column(columnTypes.text('name', 'Name'))
	.column(columnTypes.boolean('is_active', 'Active', { width: '80px' }))
	.column(columnTypes.number('priority', 'Priority', { width: '100px' }))
	.column(columnTypes.lookup('price_formula_id', 'Formula', 'price_formulas', { width: '150px' }))
	.formSchema(priceRulesInsertSchema)
	.formConfig(
		createFormConfig<PriceRulesInsert>()
			.title('Price Rule')
			.field('name', {
				span: 12,
				placeholder: 'Enter rule name'
			})
			.field('price_formula_id', {
				span: 6,
				label: 'Price Formula',
				type: 'combobox',
				searchable: true
			})
			.field('priority', {
				span: 6,
				type: 'number',
				placeholder: '0'
			})
			.field('is_active', {
				span: 6,
				label: 'Active'
			})
			.build()
	)
	.actions('?/priceRulesUpsert', '?/priceRulesUpsert', '?/priceRulesDelete')
	.parentIdField('m_product_category_id')
	.bulkOperations(true, [
		{
			label: 'Activate Selected',
			action: '?/bulkActivate',
			variant: 'default'
		},
		{
			label: 'Deactivate Selected',
			action: '?/bulkDeactivate',
			variant: 'outline'
		},
		{
			label: 'Delete Selected',
			action: '?/bulkDelete',
			variant: 'destructive',
			confirmMessage: 'Are you sure you want to delete the selected price rules?'
		}
	])
	.features(true, true, true) // searchable, sortable, exportEnabled
	.build();

export const splitLayoutConfig = createSplitLayoutConfig()
	.leftPanel({ width: '45%' })
	.rightPanel({ width: '55%' })
	.build();

// Helper function to dynamically create tab configurations
export function createTabConfigs(data: {
	priceRules: Record<string, unknown>[];
	channelMapCategory: Record<string, unknown>[];
	formPriceRules: SuperValidated<Record<string, unknown>>;
	formChannel: SuperValidated<Record<string, unknown>>;
	category: MProductCategoryRow | null;
	price_formulas: Array<{ value: number; label: string }>;
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
		),
		createTabConfig(
			'price-rules',
			'Price Rules',
			SmartRelatedTable as Component,
			{
				config: priceRulesConfig,
				items: data.priceRules,
				validatedForm: data.formPriceRules,
				parentId: data.category?.id,
				lookupData: { price_formulas: data.price_formulas },
				onRefresh: handleRefresh
			},
			{
				badge: data.priceRules?.length || 0,
				description: 'Manage price rules for this category'
			}
		)
	];
}
