<script lang="ts">
	import SmartForm from '$lib/components/forms/SmartForm.svelte';
	import { createFormConfig } from '$lib/utils/form-config.builder';
	import { mAttributeGroupInsertSchema } from '$lib/types/supabase.zod.schemas';

	let { data } = $props();

	const formConfig = createFormConfig()
		.title('Attribute Group Details')
		.field('name', { span: 12, placeholder: 'Enter name' })
		.field('code', { span: 12, placeholder: 'Enter code' })
		.build();
</script>

<SmartForm
	entityName="Attribute Group"
	form={data.form}
	schema={mAttributeGroupInsertSchema}
	action="?/upsert"
	config={formConfig}
	deleteAction="?/delete"
/>
