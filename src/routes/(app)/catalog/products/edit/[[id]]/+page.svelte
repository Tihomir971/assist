<script lang="ts">
	import { mProductInsertSchema } from '@tihomir971/assist-shared';
	import { createTabConfigs, splitLayoutConfig } from './related-configs';
	import SmartSplitLayout from '$lib/components/forms/SmartSplitLayout.svelte';
	import SmartRelatedTabs from '$lib/components/forms/SmartRelatedTabs.svelte';
	import SmartForm from '$lib/components/forms/SmartForm.svelte';
	import { createFormConfig } from '$lib/utils/form-config.builder';
	// import path from 'path'; // REMOVED
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let { data } = $props();
	const tabConfigs = $derived(createTabConfigs(data));

	const formConfig = createFormConfig()
		.title('Product Details')
		.field('is_active', { type: 'boolean', span: 4 })
		.field('is_self_service', { type: 'boolean', span: 4 })
		.field('discontinued', { type: 'boolean', span: 4 })
		.field('sku', { span: 2, label: 'SKU', readonly: !!data.entity?.id })
		.field('name', { span: 10, placeholder: 'Enter product name' })
		.field('m_product_brand_id', {
			type: 'combobox',
			span: 6,
			label: 'Product Brand',
			placeholder: 'Select a brand',
			options: data.lookupData.brands
		})
		.field('mpn', { span: 6, label: 'MPN' })
		.field('attributeset_id', {
			type: 'select',
			span: 6,
			label: 'Attribute Set',
			options: data.lookupData.attributeSets
		})
		.field('m_product_category_id', {
			type: 'combobox',
			span: 6,
			label: 'Product Category',
			placeholder: 'Select a category',
			options: data.lookupData.categories
		})

		.field('c_taxcategory_id', {
			type: 'select',
			span: 6,
			label: 'Tax Category',
			options: data.lookupData.tax
		})
		.field('c_uom_id', {
			type: 'select',
			span: 6,
			label: 'UOM',
			options: data.lookupData.uom,
			placeholder: 'Select UOM'
		})
		.field('net_quantity', { type: 'number', span: 4, fraction: 4 })
		.field('net_qty_uom_id', {
			type: 'select',
			span: 4,
			label: 'Net Qty. UOM',
			options: data.lookupData.uom,
			placeholder: 'Select UOM'
		})
		.field('shelf_life', { type: 'number', span: 4, label: 'Shelf Life (days)', fraction: 0 })
		.field('descriptionurl', { type: 'text', span: 12, label: 'Manufacturer URL' })
		.build();
</script>

<SmartSplitLayout config={splitLayoutConfig}>
	{#snippet leftPanel()}
		<SmartForm
			form={data.formProduct}
			schema={mProductInsertSchema}
			config={formConfig}
			action="?/productUpsert"
			deleteAction="?/productDelete"
			entityName="Product"
			onCancel={() => {
				const searchParam = page.url.searchParams;
				goto(`/catalog?${searchParam.toString()}`, {
					invalidate: ['catalog:products']
				});
			}}
		/>
	{/snippet}
	{#snippet rightPanel()}
		{#if data.entity?.id}
			<SmartRelatedTabs tabs={tabConfigs} defaultTab="vendors" />
		{:else}
			<div
				class="flex h-full items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-8 text-center text-muted-foreground"
			>
				Save the product to manage related data.
			</div>
		{/if}
	{/snippet}
</SmartSplitLayout>
