<script lang="ts">
	import SmartForm from '$lib/components/forms/SmartForm.svelte';
	import { createFormConfig } from '$lib/utils/form-config.builder';
	import { mProductBrandsInsertSchema } from '$lib/types/supabase.zod.schemas';

	let { data } = $props();

	const formConfig = createFormConfig()
		.title('Brand Details')
		.field('name', {
			label: 'Brand Name',
			span: 6,
			placeholder: 'Enter brand name'
		})
		.field('description', {
			label: 'Description',
			type: 'textarea',
			span: 12,
			placeholder: 'Enter brand description (optional)'
		})
		.field('logo_url', {
			label: 'Logo URL',
			span: 6,
			placeholder: 'https://example.com/logo.png'
		})
		.field('website_url', {
			label: 'Website URL',
			span: 6,
			placeholder: 'https://example.com'
		})
		.field('is_active', {
			label: 'Active',
			type: 'boolean',
			span: 12,
			description: 'Enable this brand for use in products'
		})
		.build();
</script>

<div class="container mx-auto py-6">
	<SmartForm
		entityName="Brand"
		form={data.form}
		schema={mProductBrandsInsertSchema}
		config={formConfig}
		action="?/upsert"
		deleteAction="?/delete"
	/>
</div>
