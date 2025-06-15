<script lang="ts">
	import type { SuperForm, SuperValidated } from 'sveltekit-superforms';
	import type { FieldConfig as AnalyzedFieldConfig } from '$lib/utils/schema-analyzer'; // Renamed to avoid conflict
	import * as Form from '$lib/components/ui/form'; // Using shadcn-svelte form components

	// Import individual smart field components (will be created next)
	import SmartInput from './fields/SmartInput.svelte';
	import SmartSelect from './fields/SmartSelect.svelte';
	import SmartCombobox from './fields/SmartCombobox.svelte';
	import SmartSwitch from './fields/SmartSwitch.svelte';
	import SmartTextarea from './fields/SmartTextarea.svelte';
	import SmartDatePicker from './fields/SmartDatePicker.svelte';
	import type { AnyZodObject, z } from 'zod'; // Import z for z.infer

	interface SmartFieldProps<S extends AnyZodObject> {
		field: AnalyzedFieldConfig;
		superform: SuperForm<z.infer<S>>; // Use z.infer<S> for the SuperForm data type
		value: any; // Bound value for the field
	}

	let {
		field,
		superform, // Destructure superform instance
		value = $bindable() // Use $bindable for two-way binding
	}: SmartFieldProps<AnyZodObject> = $props();

	// Determine if the field should be rendered
	// System fields like 'id', 'created_at', 'updated_at' are generally not user-editable unless explicitly shown.
	// This logic can be refined based on SmartFormConfig.showSystemFields if that prop is passed down.
	// const isSystemField = ['id', 'created_at', 'updated_at'].includes(field.name); // Visibility logic is better handled in SmartForm
	// For 'id', only render if it has a value (i.e., edit mode) and is not explicitly hidden.
	// For other system fields, generally don't render unless showSystemFields is true.
	// This specific visibility logic might be better handled in SmartForm.svelte when preparing finalFields.
	// For now, SmartField will render what it's given, assuming SmartForm has filtered.

	// `commonFieldProps` is removed. Props will be passed directly.
	// `propsFromSuperFormField` obtained via `let:props` will be passed as `props` to children.
</script>

{#if field && field.name}
	<!-- Ensure field and field.name are defined -->
	<Form.Field form={superform} name={field.name} class="mb-4">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class={field.required ? 'required font-medium' : 'font-medium'}>
					{field.label}
				</Form.Label>
				<!-- Render appropriate field type, passing down field config and Form.Control props -->
				{#if field.type === 'boolean'}
					<SmartSwitch {field} bind:value {...props} />
				{:else if field.type === 'combobox'}
					<SmartCombobox
						bind:value
						options={field.options || []}
						placeholder={field.placeholder}
						readonly={field.readonly}
						disabled={field.disabled}
						searchable={true}
						{...props}
					/>
				{:else if field.type === 'select'}
					<SmartSelect {field} bind:value {...props} />
				{:else if field.type === 'textarea'}
					<SmartTextarea {field} bind:value {...props} />
				{:else if field.type === 'date'}
					<SmartDatePicker {field} bind:value {...props} />
				{:else}
					<SmartInput {field} bind:value {...props} />
				{/if}
			{/snippet}
		</Form.Control>
		{#if field.description}
			<Form.Description class="mt-1 text-sm text-muted-foreground">
				{field.description}
			</Form.Description>
		{/if}
		<Form.FieldErrors class="mt-1 text-sm" />
	</Form.Field>
{/if}

<style>
	:global(.required::after) {
		content: '*';
		color: hsl(var(--destructive));
		margin-left: 0.125rem;
	}
</style>
