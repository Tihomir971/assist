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
import ChartVisualization from './ChartVisualization.svelte';
import StorageOnHandDisplay from './m-storageonhand-display.svelte';
import { createFormConfig } from '$lib/utils/form-config.builder';

// Define the split layout configuration
export const splitLayoutConfig = createSplitLayoutConfig()
	.leftPanel({ width: '45%' })
	.rightPanel({ width: '55%' })
	.build();

// Helper function to create tab configurations
export function createTabConfigs(data: PageData) {
	// --- Form Configurations for Drawers ---
	const productPoFormConfig = createFormConfig()
		.field('c_bpartner_id', {
			type: 'combobox',
			label: 'Partner',
			span: 12,
			options: data.lookupData.partners
		})
		.field('vendorproductno', { label: 'Vendor PN', span: 12 })
		.field('pricelist', { type: 'number', label: 'Price', span: 6 })
		.field('order_min', { type: 'number', label: 'MOQ', span: 6 })
		.field('valid_from', { type: 'date', label: 'Valid From', span: 6 })
		.field('valid_to', { type: 'date', label: 'Valid To', span: 6 })
		.field('url', { label: 'URL', span: 12 })
		.build();

	const productPackingFormConfig = createFormConfig()
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
				lookupData: { partners: data.lookupData.partners }
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
				parentId: data.entity.id
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
				lookupData: { warehouses: data.lookupData.warehouses }
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
		)
	];
}
