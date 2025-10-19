<script lang="ts">
	import SmartForm from '$lib/components/forms/SmartForm.svelte';
	import { createFormConfig } from '$lib/utils/form-config.builder';
	import { mAttributeGroupInsertSchema } from '@tihomir971/assist-shared';

	let { data } = $props();

	const formConfig = createFormConfig()
		.title('Attribute Group Details')
		.fieldTyped('name', { span: 12, placeholder: 'Enter name' })
		.fieldTyped('code', { span: 12, placeholder: 'Enter code' })
		.build();
</script>

<div class="container mx-auto h-full max-w-2xl py-6">
	<SmartForm
		entityName="Attribute Group"
		form={data.form}
		schema={mAttributeGroupInsertSchema}
		action="?/upsert"
		config={formConfig}
		deleteAction="?/delete"
	/>
</div>
