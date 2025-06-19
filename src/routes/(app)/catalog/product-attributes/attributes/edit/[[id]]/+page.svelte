<script lang="ts">
	import SmartForm from '$lib/components/forms/SmartForm.svelte';
	import SmartRelatedTable from '$lib/components/forms/SmartRelatedTable.svelte';
	import { createFormConfig } from '$lib/utils/form-config.builder';
	import { attributeOptionsConfig } from './related-configs';
	import { mAttributeFormSchema } from './schema';

	let { data } = $props();

	const formConfig = createFormConfig()
		.title('Attribute')
		.field('name', {
			label: 'Name',
			span: 6,
			placeholder: 'e.g., Color, Size'
		})
		.field('code', {
			label: 'Code',
			span: 6,
			placeholder: 'e.g., COLOR, SIZE'
		})
		.field('attribute_group_id', {
			label: 'Group',
			type: 'select',
			span: 6,
			options: data.attributeGroups
		})
		.field('attribute_type', {
			label: 'Type',
			type: 'select',
			span: 6,
			options: [
				{ value: 'text', label: 'Text' },
				{ value: 'number', label: 'Number' },
				{ value: 'boolean', label: 'Boolean' },
				{ value: 'date', label: 'Date' },
				{ value: 'single_select', label: 'Single Select' },
				{ value: 'multi_select', label: 'Multi Select' }
			]
		})
		.field('description', {
			label: 'Description',
			type: 'textarea',
			span: 12,
			placeholder: 'Enter a description for the attribute'
		})
		.field('is_active', {
			label: 'Active',
			type: 'boolean',
			span: 12
		})
		.build();

	let attributeType = $derived(data.form.data.attribute_type);
</script>

<div class="container mx-auto h-full max-w-2xl overflow-auto py-6">
	<SmartForm
		entityName="Attribute"
		form={data.form}
		schema={mAttributeFormSchema}
		config={formConfig}
		action="?/upsert"
		deleteAction="?/delete"
	/>

	{#if data.entity?.id && (attributeType === 'single_select' || attributeType === 'multi_select')}
		<div class="mt-8">
			<SmartRelatedTable
				config={attributeOptionsConfig}
				items={data.attributeOptions}
				validatedForm={data.formAttributeOptions}
				parentId={data.entity.id}
			/>
		</div>
	{/if}
</div>
