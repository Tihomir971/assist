<script lang="ts">
	import SmartSplitLayout from '$lib/components/forms/SmartSplitLayout.svelte';
	import SmartForm from '$lib/components/forms/SmartForm.svelte';
	import { createFormConfig } from '$lib/utils/form-config.builder';
	import { splitLayoutConfig } from './related-configs';
	import { cBpartnerInsertSchema } from '@tihomir971/assist-shared';

	let { data } = $props();

	const formConfig = createFormConfig()
		.title('Contact')
		.fieldTyped('display_name', { label: 'Name', span: 6 })
		.fieldTyped('value', { label: 'Value', span: 6 })
		.fieldTyped('taxid', { label: 'Tax ID', span: 6 })
		.fieldTyped('email', { label: 'Email', span: 6 })
		.fieldTyped('phone', { label: 'Phone', span: 6 })
		.fieldTyped('address1', { label: 'Address 1', span: 6 })
		.fieldTyped('address2', { label: 'Address 2', span: 6 })
		.fieldTyped('postal', { label: 'Postal Code', span: 6 })
		.fieldTyped('city', { label: 'City', span: 6 })
		.fieldTyped('is_active', { label: 'Active', type: 'boolean', span: 4 })
		.fieldTyped('iscustomer', { label: 'Is Customer', type: 'boolean', span: 4 })
		.fieldTyped('isvendor', { label: 'Is Vendor', type: 'boolean', span: 4 })
		.build();
</script>

<div class="container mx-auto h-full py-6">
	<SmartSplitLayout config={splitLayoutConfig}>
		{#snippet leftPanel()}
			<SmartForm
				entityName="Contact"
				form={data.form}
				schema={cBpartnerInsertSchema}
				config={formConfig}
				action="?/upsert"
				deleteAction="?/delete"
			/>
		{/snippet}

		{#snippet rightPanel()}
			<div class="p-4">No related data for this entity.</div>
		{/snippet}
	</SmartSplitLayout>
</div>
