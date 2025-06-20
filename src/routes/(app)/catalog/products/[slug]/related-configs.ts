import { createSplitLayoutConfig, createTabConfig } from '$lib/utils/split-layout-config.builder';
import type { Component } from 'svelte';
import type { PageData } from './$types';

// Import all components for the tabs
import ProductPOCard from './m-product-po-card.svelte';
import StorageOnHandCard from './m-storageonhand-card.svelte';
import ReplenishCard from './m-replenish-card.svelte';
import ChartVisualization from './ChartVisualization.svelte';
import ProductPackingCard from './m-product-packing-card.svelte'; // The new component

// Define the split layout configuration
export const splitLayoutConfig = createSplitLayoutConfig()
	.leftPanel({ width: '45%' })
	.rightPanel({ width: '55%' })
	.build();

// Helper function to create tab configurations
export function createTabConfigs(data: PageData) {
	return [
		createTabConfig(
			'vendors',
			'Vendors',
			ProductPOCard as Component,
			{
				validatedForm: data.formProductPo,
				partners: data.partners,
				productId: data.productId,
				data: data.purchases
			},
			{ badge: data.purchases?.length || 0, order: 1 }
		),
		createTabConfig(
			'packing', // New tab for barcodes
			'Barcodes',
			ProductPackingCard as Component,
			{
				productPacking: data.productPacking,
				validatedForm: data.formProductPacking,
				m_product_id: data.productId
			},
			{ badge: data.productPacking?.length || 0, order: 2 }
		),
		createTabConfig(
			'stock',
			'Stock',
			StorageOnHandCard as Component,
			{
				form: data.formStorageOnHand,
				productId: data.productId,
				warehouses: data.warehouses
			},
			{ order: 3 }
		),
		createTabConfig(
			'replenish',
			'Replenish',
			ReplenishCard as Component,
			{
				validatedForm: data.formReplenish,
				data: data.replenishes,
				warehouses: data.warehouses,
				productId: data.productId
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
