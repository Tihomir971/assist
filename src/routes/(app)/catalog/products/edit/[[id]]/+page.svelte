<script lang="ts">
	import { mProductInsertSchema } from '@tihomir971/assist-shared';
	import { createTabConfigs, splitLayoutConfig } from './related-configs';
	import SmartSplitLayout from '$lib/components/forms/SmartSplitLayout.svelte';
	import SmartRelatedTabs from '$lib/components/forms/SmartRelatedTabs.svelte';
	import SmartForm from '$lib/components/forms/SmartForm.svelte';
	import { createFormConfig } from '$lib/utils/form-config.builder';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	let { data } = $props();
	const tabConfigs = $derived(createTabConfigs(data));

	const formConfig = createFormConfig()
		.title('Product Details')
		.fieldTyped('is_active', { type: 'boolean', span: 4 })
		.fieldTyped('is_self_service', { type: 'boolean', span: 4 })
		.fieldTyped('discontinued', { type: 'boolean', span: 4 })
		.fieldTyped('sku', { span: 2, label: 'SKU', readonly: !!data.entity?.id })
		.fieldTyped('name', { span: 10, placeholder: 'Enter product name' })
		.fieldTyped('m_product_brand_id', {
			type: 'combobox',
			span: 6,
			label: 'Product Brand',
			placeholder: 'Select a brand',
			componentProps: {
				options: data.lookupData.brands
			}
		})
		.fieldTyped('mpn', { span: 6, label: 'MPN' })
		.fieldTyped('attributeset_id', {
			type: 'select',
			span: 6,
			label: 'Attribute Set',
			componentProps: {
				options: data.lookupData.attributeSets
			}
		})
		.fieldTyped('m_product_category_id', {
			type: 'combobox',
			span: 6,
			label: 'Product Category',
			placeholder: 'Select a category',
			componentProps: {
				options: data.lookupData.categories
			}
		})

		.fieldTyped('c_taxcategory_id', {
			type: 'select',
			span: 6,
			label: 'Tax Category',
			componentProps: {
				options: data.lookupData.tax
			}
		})
		.fieldTyped('c_uom_id', {
			type: 'select',
			span: 6,
			label: 'UOM',
			componentProps: {
				options: data.lookupData.uom
			},
			placeholder: 'Select UOM'
		})
		.fieldTyped('net_quantity', {
			type: 'number',
			span: 4,
			componentProps: {
				min: 0,
				formatOptions: { minimumFractionDigits: 4, maximumFractionDigits: 4 }
			}
		})
		.fieldTyped('net_qty_uom_id', {
			type: 'select',
			span: 4,
			label: 'Net Qty. UOM',
			componentProps: {
				options: data.lookupData.uom
			},
			placeholder: 'Select UOM'
		})
		.fieldTyped('shelf_life', {
			type: 'number',
			span: 4,
			label: 'Shelf Life (days)',
			componentProps: {
				min: 0,
				formatOptions: { minimumFractionDigits: 0, maximumFractionDigits: 0 }
			}
		})
		.fieldTyped('descriptionurl', { type: 'url', span: 12, label: 'Manufacturer URL' })
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
				// @ts-expect-error - Dynamic URL construction for search params navigation
				goto(resolve(`/catalog?${searchParam.toString()}`), {
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
