import { createSplitLayoutConfig, createTabConfig } from '$lib/utils/split-layout-config.builder';
import type { Component } from 'svelte';
import type { PageData } from './$types';
import { columnTypes, createRelatedTableConfig } from '$lib/utils/related-table-config.builder';
import {
	mProductPackingInsertSchema,
	mProductPoInsertSchema,
	mReplenishInsertSchema,
	cChannelMapProductInsertSchema
} from '@tihomir971/assist-shared';
import SmartRelatedTable from '$lib/components/forms/SmartRelatedTable.svelte';
import StorageOnHandDisplay from './m-storageonhand-display.svelte';
import SmartProductAttributes from './SmartProductAttributes.svelte';
import { createFormConfig } from '$lib/utils/form-config.builder';
import { invalidate } from '$app/navigation';
import InTabEChart from '$lib/components/charts/InTabEChart.svelte';

// Define the split layout configuration
export const splitLayoutConfig = createSplitLayoutConfig()
	.leftPanel({ width: '40%' })
	.rightPanel({ width: '60%' })
	.build();

// Helper function to create tab configurations
export function createTabConfigs(data: PageData) {
	// Refresh handler to reload data after operations
	const handleRefresh = () => {
		invalidate('catalog:products');
	};

	// --- Form Configurations for Drawers ---
	const productPoFormConfig = createFormConfig()
		.title('Product Supplier')
		.fieldTyped('c_bpartner_id', {
			type: 'combobox',
			label: 'Partner',
			placeholder: 'Enter Partner...',
			span: 12,
			componentProps: {
				options: data.lookupData.partners
			}
		})
		.fieldTyped('vendorproductno', { label: 'Vendor PN', span: 12 })
		.fieldTyped('pricelist', {
			type: 'number',
			label: 'Price',
			span: 6,
			componentProps: {
				min: 0,
				formatOptions: { minimumFractionDigits: 2, maximumFractionDigits: 2 }
			}
		})
		.fieldTyped('order_min', {
			type: 'number',
			label: 'MOQ',
			span: 6,
			componentProps: {
				min: 0,
				formatOptions: { minimumFractionDigits: 0, maximumFractionDigits: 0 }
			}
		})
		.fieldTyped('valid_from', { type: 'date', label: 'Valid From', span: 6 })
		.fieldTyped('valid_to', { type: 'date', label: 'Valid To', span: 6 })
		.fieldTyped('url', { label: 'URL', span: 12 })
		.fieldTyped('created_at', { type: 'datetime', label: 'Created at', span: 6, readonly: true })
		.fieldTyped('updated_at', { type: 'datetime', label: 'Updated at', span: 6, readonly: true })
		.build();

	const productPackingFormConfig = createFormConfig()
		.title('Packing')
		.fieldTyped('packing_type', {
			type: 'select',
			label: 'Packing Type',
			span: 12,
			componentProps: {
				options: [
					{ value: 'Individual', label: 'Individual' },
					{ value: 'Pack', label: 'Pack' },
					{ value: 'Pallet', label: 'Pallet' }
				]
			}
		})
		.fieldTyped('unitsperpack', { type: 'number', label: 'Units Per Pack', span: 6 })
		.fieldTyped('gtin', { label: 'GTIN', span: 6 })
		.fieldTyped('is_display', { type: 'boolean', label: 'Is Display Box?', span: 12 })
		.build();

	const replenishFormConfig = createFormConfig()
		.title('Replenishment Rule')
		.fieldTyped('m_warehouse_id', {
			type: 'select',
			label: 'Warehouse',
			span: 6,
			componentProps: {
				options: data.lookupData.warehouses,
				searchable: false,
				clearable: false
			}
		})
		.fieldTyped('m_warehousesource_id', {
			type: 'select',
			label: 'Source Warehouse',
			span: 6,
			componentProps: {
				options: data.lookupData.warehouses,
				searchable: false,
				clearable: false
			}
		})
		.fieldTyped('level_min', {
			type: 'number',
			label: 'Min. Level',
			span: 4,
			componentProps: {
				min: 0,
				formatOptions: { minimumFractionDigits: 0, maximumFractionDigits: 0 }
			}
		})
		.fieldTyped('level_max', {
			type: 'number',
			label: 'Max. Level',
			span: 4,
			componentProps: {
				min: 0,
				formatOptions: { minimumFractionDigits: 0, maximumFractionDigits: 0 }
			}
		})
		.fieldTyped('qtybatchsize', {
			type: 'number',
			label: 'Batch Size',
			span: 4,
			componentProps: {
				min: 0,
				formatOptions: { minimumFractionDigits: 0, maximumFractionDigits: 0 }
			}
		})
		.build();

	// --- Related Table Configurations ---
	const productPoConfig = createRelatedTableConfig()
		.title('Vendors')
		.column(columnTypes.lookup('c_bpartner_id', 'Partner', 'partners'))
		.column(columnTypes.text('vendorproductno', 'Vendor PN'))
		.column(columnTypes.number('order_min', 'MOQ'))
		.column(columnTypes.number('pricelist', 'Price'))
		.column(columnTypes.url('url', 'URL'))
		.column(columnTypes.date('valid_from', 'From'))
		.column(columnTypes.date('valid_to', 'To'))
		.formSchema(mProductPoInsertSchema)
		.formConfig(productPoFormConfig)
		.actions('?/productPoUpsert', '?/productPoUpsert', '?/productPoDelete')
		.parentIdField('m_product_id')
		.build();

	const productPackingConfig = createRelatedTableConfig()
		.title('Barcodes')
		.column(columnTypes.text('packing_type', 'Package'))
		.column(columnTypes.number('unitsperpack', 'Qty'))
		.column(columnTypes.text('gtin', 'Barcode'))
		.column(columnTypes.boolean('is_display', 'Display'))
		.formSchema(mProductPackingInsertSchema)
		.formConfig(productPackingFormConfig)
		.actions('?/productPackingUpsert', '?/productPackingUpsert', '?/productPackingDelete')
		.parentIdField('m_product_id')
		.build();

	const replenishConfig = createRelatedTableConfig()
		.title('Replenishment')
		.column(columnTypes.lookup('m_warehouse_id', 'Warehouse', 'warehouses'))
		.column(columnTypes.lookup('m_warehousesource_id', 'Source', 'warehouses'))
		.column(columnTypes.number('level_min', 'Min Level'))
		.column(columnTypes.number('level_max', 'Max Level'))
		.column(columnTypes.number('qtybatchsize', 'Batch Size'))
		.formSchema(mReplenishInsertSchema)
		.formConfig(replenishFormConfig)
		.actions('?/replenishUpsert', '?/replenishUpsert', '?/replenishDelete')
		.parentIdField('m_product_id')
		.build();

	const channelMappingFormConfig = createFormConfig()
		.title('Channel Product Mapping')
		.fieldTyped('c_channel_id', {
			type: 'combobox',
			label: 'Channel',
			span: 12,
			componentProps: {
				options: data.lookupData.channels
			}
		})
		.fieldTyped('external_product_id', { label: 'External ID', span: 12 })
		.fieldTyped('url', { label: 'URL', span: 12 })
		.build();

	const channelMappingConfig = createRelatedTableConfig()
		.title('Channel Mapping')
		.column(columnTypes.lookup('c_channel_id', 'Channel', 'channels'))
		.column(columnTypes.text('external_product_id', 'External ID'))
		.column(columnTypes.url('url', 'URL'))
		.formSchema(cChannelMapProductInsertSchema)
		.formConfig(channelMappingFormConfig)
		.actions('?/channelMapProductUpsert', '?/channelMapProductUpsert', '?/channelMapProductDelete')
		.parentIdField('m_product_id')
		.build();

	// Return empty array if no entity (new product creation)
	if (!data.entity) {
		return [];
	}

	return [
		createTabConfig(
			'channel-mapping',
			'Mapping',
			SmartRelatedTable as Component,
			{
				config: channelMappingConfig,
				items: data.channelMapProduct,
				validatedForm: data.formChannelMapProduct,
				parentId: data.entity.id,
				lookupData: { channels: data.lookupData.channels },
				onRefresh: handleRefresh
			},
			{ badge: data.channelMapProduct?.length || 0, order: 0 }
		),
		createTabConfig(
			'vendors',
			'Vendors',
			SmartRelatedTable as Component,
			{
				config: productPoConfig,
				items: data.purchases,
				validatedForm: data.formProductPo,
				parentId: data.entity.id,
				lookupData: { partners: data.lookupData.partners },
				onRefresh: handleRefresh
			},
			{ badge: data.purchases?.length || 0, order: 1 }
		),
		createTabConfig(
			'packing',
			'Barcodes',
			SmartRelatedTable as Component,
			{
				config: productPackingConfig,
				items: data.productPacking,
				validatedForm: data.formProductPacking,
				parentId: data.entity.id,
				onRefresh: handleRefresh
			},
			{ badge: data.productPacking?.length || 0, order: 2 }
		),
		createTabConfig(
			'stock',
			'Stock',
			StorageOnHandDisplay as Component,
			{
				storageOnHand: data.storageonhand,
				warehouses: data.lookupData.warehouses
			},
			{ order: 3 }
		),
		createTabConfig(
			'replenish',
			'Replenish',
			SmartRelatedTable as Component,
			{
				config: replenishConfig,
				items: data.replenishes,
				validatedForm: data.formReplenish,
				parentId: data.entity.id,
				lookupData: { warehouses: data.lookupData.warehouses },
				onRefresh: handleRefresh
			},
			{ badge: data.replenishes?.length || 0, order: 4 }
		),
		createTabConfig(
			'sales-chart',
			'Sales Chart',
			InTabEChart as Component,
			{
				data: data.salesByWeeks.data
			},
			{ order: 5 }
		),
		createTabConfig(
			'attributes',
			'Attributes',
			SmartProductAttributes as Component,
			{
				supabase: data.supabase,
				productId: data.entity.id,
				attributeSetId: data.entity.attributeset_id,
				productAttributeValues: data.productAttributeValues,
				formProductAttributeValue: data.formProductAttributeValue,
				productAttributeOptions: data.productAttributeOptions,
				formProductAttributeOption: data.formProductAttributeOption,
				attributeSetAttributes: data.attributeSetAttributes,
				attributeOptionsLookup: data.attributeOptionsLookup,
				lookupData: data.lookupData
			},
			{ order: 6 }
		)
	];
}
