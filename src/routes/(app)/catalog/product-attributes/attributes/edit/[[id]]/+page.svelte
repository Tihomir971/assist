<script lang="ts">
	import SmartForm from '$lib/components/forms/SmartForm.svelte';
	import { createFormConfig } from '$lib/utils/form-config.builder';
	import { splitLayoutConfig, createTabConfigs } from './related-configs';
	import { mAttributeFormSchema } from './schema';
	import SmartSplitLayout from '$lib/components/forms/SmartSplitLayout.svelte';
	import SmartRelatedTabs from '$lib/components/forms/SmartRelatedTabs.svelte';

	let { data } = $props();

	let attributeType = $derived(data.form.data.attribute_type);

	const formConfig = $derived.by(() => {
		const showUom =
			attributeType === 'number' ||
			attributeType === 'single_select' ||
			attributeType === 'multi_select';

		return createFormConfig()
			.title('Attribute')
			.field('name', {
				label: 'Name',
				span: 12,
				placeholder: 'e.g., Color, Size, Screen Diagonal'
			})
			.field('code', {
				label: 'Code',
				span: 12,
				placeholder: 'e.g., COLOR, SIZE, SCREEN_DIAGONAL'
			})
			.fieldTyped('attribute_group_id', {
				label: 'Group',
				type: 'select',
				span: 6,
				componentProps: {
					options: data.attributeGroups
				}
			})
			.fieldTyped('attribute_type', {
				label: 'Type',
				type: 'select',
				span: 6,
				componentProps: {
					options: [
						{ value: 'text', label: 'Text' },
						{ value: 'number', label: 'Number' },
						{ value: 'boolean', label: 'Boolean' },
						{ value: 'date', label: 'Date' },
						{ value: 'single_select', label: 'Single Select' },
						{ value: 'multi_select', label: 'Multi Select' }
					]
				}
			})
			.fieldTyped('c_uom_id', {
				label: 'Unit of Measure',
				type: 'select',
				span: 6,
				componentProps: {
					options: data.uoms
				},
				placeholder: 'Select unit (optional)',
				description:
					'Specify the unit for numeric values or select/multi-select options (e.g., inches, cm, kg)',
				hidden: !showUom
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
	});

	const tabConfigs = $derived.by(() => {
		return createTabConfigs({
			attributeOptions: data.attributeOptions,
			formAttributeOptions: data.formAttributeOptions,
			entity: data.entity || undefined
		});
	});
</script>

<div class="container mx-auto h-full py-6">
	<SmartSplitLayout config={splitLayoutConfig}>
		{#snippet leftPanel()}
			<SmartForm
				entityName="Attribute"
				form={data.form}
				schema={mAttributeFormSchema}
				config={formConfig}
				action="?/upsert"
				deleteAction="?/delete"
			/>
		{/snippet}
		{#snippet rightPanel()}
			{#if data.entity?.id && (attributeType === 'single_select' || attributeType === 'multi_select')}
				<SmartRelatedTabs tabs={tabConfigs} />
			{:else if data.entity?.id}
				<div class="flex h-full items-center justify-center text-muted-foreground">
					Select 'Single Select' or 'Multi Select' type to add options.
				</div>
			{:else}
				<div
					class="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-muted text-muted-foreground"
				>
					<div class="text-center">
						<p class="text-lg font-medium">Save Attribute First</p>
						<p class="mt-1 text-sm">Complete the form on the left to manage related data</p>
					</div>
				</div>
			{/if}
		{/snippet}
	</SmartSplitLayout>
</div>
