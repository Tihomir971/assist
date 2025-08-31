<script lang="ts">
	import SmartSplitLayout from '$lib/components/forms/SmartSplitLayout.svelte';
	import SmartForm from '$lib/components/forms/SmartForm.svelte';
	import SmartRelatedTabs from '$lib/components/forms/SmartRelatedTabs.svelte';
	import { createFormConfig } from '$lib/utils/form-config.builder';
	import { splitLayoutConfig, createTabConfigs } from './related-configs';
	import { mProductCategoryInsertSchema } from '$lib/types/supabase.schemas';
	import type { MProductCategoryInsert } from '$lib/types/supabase.zod';

	let { data } = $props();

	type CategoryFormData = MProductCategoryInsert;

	const formConfig = createFormConfig<CategoryFormData>()
		.title('Category Details')
		.multilingualInput('names', {
			label: 'Name',
			span: 12,
			requiredLocales: ['en-US'],
			defaultLocale: 'en-US'
		})
		.multilingualTextarea('descriptions', {
			label: 'Description',
			span: 12,
			rows: 4,
			showAddLocale: true,
			copyBetweenLocales: true
		})
		.field('parent_id', {
			label: 'Parent Category',
			span: 6,
			searchable: true,
			options: data.categories
		})
		.field('is_active', { label: 'Active', type: 'boolean', span: 6 })
		.field('is_self_service', { label: 'Self Service', type: 'boolean', span: 6 })
		.build();

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
