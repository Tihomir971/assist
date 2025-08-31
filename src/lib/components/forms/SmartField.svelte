<script lang="ts">
	import type { SuperForm } from 'sveltekit-superforms';
	import type { FieldConfig as AnalyzedFieldConfig } from '$lib/utils/schema-analyzer4'; // Renamed to avoid conflict
	import * as Form from '$lib/components/ui/form'; // Using shadcn-svelte form components

	// Import individual smart field components (will be created next)
	import SmartInput from './fields/SmartInput.svelte';
	import SmartNumberInput from './fields/SmartNumberInput.svelte';
	import SmartSelect from './fields/SmartSelect.svelte';
	import SmartCombobox from './fields/SmartCombobox.svelte';
	import SmartSwitch from './fields/SmartSwitch.svelte';
	import SmartTextarea from './fields/SmartTextarea.svelte';
	import SmartDatePicker from './fields/SmartDatePicker.svelte';
	import SmartDatetime from './fields/SmartDatetime.svelte';
	import MultilingualInput from './fields/multilingual/MultilingualInput.svelte';
	import MultilingualTextarea from './fields/multilingual/MultilingualTextarea.svelte';
	import type { ZodObject, z } from 'zod/v4'; // Import z for z.infer

	interface SmartFieldProps<S extends ZodObject<any>> {
		field: AnalyzedFieldConfig;
		superform: SuperForm<z.infer<S>>; // Use z.infer<S> for the SuperForm data type
		value: any; // Bound value for the field
	}

	let {
		field,
		superform, // Destructure superform instance
		value = $bindable() // Use $bindable for two-way binding
	}: SmartFieldProps<ZodObject<any>> = $props();
</script>

{#if field && field.name}
	<!-- Check if field should be hidden -->
	{#if field.hidden}
		<!-- Render as hidden input for form data inclusion -->
		<input type="hidden" name={field.name} bind:value />
	{:else}
		<!-- Render as normal form field -->
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
					{:else if field.type === 'datetime'}
						<SmartDatetime {field} bind:value {...props} />
					{:else if field.type === 'number'}
						<SmartNumberInput {field} bind:value {...props} />
					{:else if field.type === 'multilingual_input'}
						<MultilingualInput
							bind:value
							{superform}
							config={field.multilingualConfig || {}}
							placeholder={field.placeholder}
							{...props}
						/>
					{:else if field.type === 'multilingual_textarea'}
						<MultilingualTextarea
							bind:value
							{superform}
							config={field.multilingualConfig || {}}
							placeholder={field.placeholder}
							{...props}
						/>
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
{/if}

<style>
	:global(.required::after) {
		content: '*';
		color: var(--destructive);
		/* margin-left: 0.125rem; */
	}
</style>
