import { createSplitLayoutConfig, createTabConfig } from '$lib/utils/split-layout-config.builder';
import type { Component } from 'svelte';
import type { PageData } from './$types';
import { columnTypes, createRelatedTableConfig } from '$lib/utils/related-table-config.builder';
import {
	mProductPackingInsertSchema,
	mProductPoInsertSchema,
	mReplenishInsertSchema
} from '$lib/types/supabase.zod.schemas';
import SmartRelatedTable from '$lib/components/forms/SmartRelatedTable.svelte';
import ChartVisualization from '$lib/components/charts/ChartVisualization.svelte';
import StorageOnHandDisplay from './m-storageonhand-display.svelte';
import SmartProductAttributes from './SmartProductAttributes.svelte';
import { createFormConfig } from '$lib/utils/form-config.builder';
import { invalidate } from '$app/navigation';

// Define the split layout configuration
export const splitLayoutConfig = createSplitLayoutConfig()
	.leftPanel({ width: '45%' })
	.rightPanel({ width: '55%' })
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
		.field('c_bpartner_id', {
			type: 'combobox',
			label: 'Partner',
			placeholder: 'Enter Partner...',
			span: 12,
			options: data.lookupData.partners
		})
		.field('vendorproductno', { label: 'Vendor PN', span: 12 })
		.field('pricelist', { type: 'number', label: 'Price', span: 6 })
		.field('order_min', { type: 'number', label: 'MOQ', span: 6 })
		.field('valid_from', { type: 'date', label: 'Valid From', span: 6 })
		.field('valid_to', { type: 'date', label: 'Valid To', span: 6 })
		.field('url', { label: 'URL', span: 12 })
		.field('created_at', { type: 'datetime', label: 'Created at', span: 6, readonly: true })
		.field('updated_at', { type: 'datetime', label: 'Updated at', span: 6, readonly: true })
		.build();

	const productPackingFormConfig = createFormConfig()
		.title('Packing')
		.field('packing_type', {
			type: 'select',
			label: 'Packing Type',
			span: 12,
			options: [
				{ value: 'Individual', label: 'Individual' },
				{ value: 'Pack', label: 'Pack' },
				{ value: 'Pallet', label: 'Pallet' }
			]
		})
		.field('unitsperpack', { type: 'number', label: 'Units Per Pack', span: 6 })
		.field('gtin', { label: 'GTIN', span: 6 })
		.field('is_display', { type: 'boolean', label: 'Is Display Box?', span: 12 })
		.build();

	const replenishFormConfig = createFormConfig()
		.title('Replenishment Rule')
		.field('m_warehouse_id', {
			type: 'select',
			label: 'Warehouse',
			span: 12,
			options: data.lookupData.warehouses
		})
		.field('m_warehousesource_id', {
			type: 'select',
			label: 'Source Warehouse',
			span: 12,
			options: data.lookupData.warehouses
		})
		.field('level_min', { type: 'number', label: 'Min. Level', span: 6 })
		.field('level_max', { type: 'number', label: 'Max. Level', span: 6 })
		.field('qtybatchsize', { type: 'number', label: 'Batch Size', span: 12 })
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

	return [
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
			ChartVisualization as Component,
			{
				data: data.salesByWeeks
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
				attributeOptionsLookup: data.attributeOptionsLookup
			},
			{ order: 6 }
		)
	];
}
