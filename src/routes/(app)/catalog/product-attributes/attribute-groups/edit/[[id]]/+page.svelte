<script lang="ts">
	import SmartForm from '$lib/components/forms/SmartForm4.svelte';
	import { createFormConfig } from '$lib/utils/form-config.builder';
	import { mAttributeGroupInsertSchema } from '@tihomir971/assist-shared';

	let { data } = $props();

	const formConfig = createFormConfig()
		.title('Attribute Group Details')
		.field('name', { span: 12, placeholder: 'Enter name' })
		.field('code', { span: 12, placeholder: 'Enter code' })
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
