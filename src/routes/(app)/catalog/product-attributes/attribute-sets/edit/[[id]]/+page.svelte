<script lang="ts">
	import SmartSplitLayout from '$lib/components/forms/SmartSplitLayout.svelte';
	import SmartForm from '$lib/components/forms/SmartForm.svelte';
	import SmartRelatedTabs from '$lib/components/forms/SmartRelatedTabs.svelte';
	import { createFormConfig } from '$lib/utils/form-config.builder';
	import { splitLayoutConfig, createTabConfigs } from './related-configs';
	import { mAttributesetInsertSchema } from '$lib/types/supabase.zod.schemas';
	import { AttributeSetAttributeService } from '$lib/services/supabase/attribute-set-attribute.service';
	import { browser } from '$app/environment';
	import { page } from '$app/state';

	let { data } = $props();

	// Reactive data for related tables
	let attributeSetAttributes = $state(data.attributeSetAttributes);

	// Function to refresh related data
	async function refreshRelatedData() {
		if (!browser || !data.entity?.id) return;

		try {
			// Get supabase client from page data
			const supabase = page.data.supabase;
			const service = new AttributeSetAttributeService(supabase);
			const freshData = await service.getByAttributeSetId(data.entity.id);
			attributeSetAttributes = freshData;
		} catch (error) {
			console.error('Failed to refresh related data:', error);
		}
	}

	const formConfig = createFormConfig()
		.title('Attribute Set')
		.field('name', {
			label: 'Name',
			span: 6,
			placeholder: 'e.g., Electronics, Clothing'
		})
		.field('code', {
			label: 'Code',
			span: 6,
			placeholder: 'e.g., ELECTRONICS, CLOTHING'
		})
		.field('description', {
			label: 'Description',
			type: 'textarea',
			span: 12,
			placeholder: 'Enter a description for the attribute set'
		})
		.field('is_active', {
			label: 'Active',
			type: 'boolean',
			span: 12
		})
		.build();

	// Create reactive tab configurations that update when data changes
	const tabConfigs = $derived(
		createTabConfigs({
			attributeSetAttributes: attributeSetAttributes,
			formAttributeSetAttributes: data.formAttributeSetAttributes,
			entity: data.entity || undefined,
			attributes: data.attributes
		})
	);
</script>

<div class="container mx-auto h-full py-6">
	<SmartSplitLayout config={splitLayoutConfig}>
		{#snippet leftPanel()}
			<SmartForm
				entityName="Attribute Set"
				form={data.form}
				schema={mAttributesetInsertSchema}
				config={formConfig}
				action="?/upsert"
				deleteAction="?/delete"
			/>
		{/snippet}

		{#snippet rightPanel()}
			{#if data.entity?.id}
				<SmartRelatedTabs tabs={tabConfigs} defaultTab="attributes" variant="default" />
			{:else}
				<div
					class="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted text-muted-foreground"
				>
					<div class="text-center">
						<p class="text-lg font-medium">Save Attribute Set First</p>
						<p class="mt-1 text-sm">Complete the form on the left to manage related data</p>
					</div>
				</div>
			{/if}
		{/snippet}
	</SmartSplitLayout>
</div>
