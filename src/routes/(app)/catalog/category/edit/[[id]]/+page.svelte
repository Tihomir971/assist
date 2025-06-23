<script lang="ts">
	import SmartSplitLayout from '$lib/components/forms/SmartSplitLayout.svelte';
	import SmartForm from '$lib/components/forms/SmartForm.svelte';
	import SmartRelatedTabs from '$lib/components/forms/SmartRelatedTabs.svelte';
	import { createFormConfig } from '$lib/utils/form-config.builder';
	import { splitLayoutConfig, createTabConfigs } from './related-configs';
	import { mProductCategoryInsertSchema } from '$lib/types/supabase.zod.schemas';
	import type { z } from 'zod';

	let { data } = $props();

	type CategoryFormData = z.infer<typeof mProductCategoryInsertSchema>;

	// Main form configuration
	const formConfig = createFormConfig<CategoryFormData>()
		.title('Category Details')
		.field('name', { label: 'Name', span: 6 })
		.field('parent_id', {
			label: 'Parent Category',
			span: 6,
			searchable: true,
			options: data.categories
		})
		.field('description', { label: 'Description', type: 'textarea', span: 12 })
		.field('is_active', { label: 'Active', type: 'boolean', span: 6 })
		.field('is_self_service', { label: 'Self Service', type: 'boolean', span: 6 })
		.build();

	// Create reactive tab configurations that update when data changes
	const tabConfigs = $derived(createTabConfigs(data));
</script>

<div class="container mx-auto h-full py-6">
	<SmartSplitLayout config={splitLayoutConfig}>
		{#snippet leftPanel()}
			<SmartForm
				entityName="Category"
				form={data.formCategory}
				schema={mProductCategoryInsertSchema}
				config={formConfig}
				action="?/categoryUpsert"
				deleteAction="?/categoryDelete"
			/>
		{/snippet}

		{#snippet rightPanel()}
			{#if data.category?.id}
				<SmartRelatedTabs tabs={tabConfigs} defaultTab="channel-mappings" />
			{:else}
				<div
					class="flex h-full items-center justify-center rounded-lg border border-dashed text-center"
				>
					<div class="p-4">
						<h3 class="text-lg font-semibold">Save the category to manage related data.</h3>
						<p class="mt-1 text-sm text-muted-foreground">
							Once you create the main category, you will be able to add channel mappings and price
							rules here.
						</p>
					</div>
				</div>
			{/if}
		{/snippet}
	</SmartSplitLayout>
</div>
