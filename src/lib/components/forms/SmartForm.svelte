<script lang="ts">
	import type { SuperValidated, SuperForm } from 'sveltekit-superforms';
	import type { AnyZodObject, z, ZodSchema } from 'zod';
	import type { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder';
	import type { SmartFormConfig, FieldOverride } from '$lib/types/form-config.types';
	import {
		SchemaAnalyzer,
		type FormConfig as AnalyzedFormConfig,
		type FieldConfig as AnalyzedFieldConfig
	} from '$lib/utils/schema-analyzer';
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import SmartField from './SmartField.svelte'; // This will be created next (Day 3)
	import FormActions from './FormActions.svelte';

	// Define a more specific type for form data, inferring from Zod schema
	type FormDataFromSchema<S extends ZodSchema<any, any>> = z.infer<S>;

	interface SmartFormProps<S extends AnyZodObject> {
		form: SuperValidated<z.infer<S>>; // Superforms instance
		schema: S; // Zod schema for the form
		action: string; // SvelteKit action path (e.g., "?/categoryUpsert")
		entityName: string; // Display name for the entity (e.g., "Category")

		config?: SmartFormConfig; // Optional configuration for overrides and layout
		payloadBuilder?: SmartPayloadBuilder<FormDataFromSchema<S>, Partial<FormDataFromSchema<S>>>; // Optional custom payload builder

		onSuccess?: (data: FormDataFromSchema<S>) => void;
		onError?: (error: string | null, form: SuperForm<z.infer<S>>) => void;
		onSubmit?: (data: FormDataFromSchema<S>, event?: SubmitEvent) => void | Promise<void>;
		onCancel?: () => void;
		superformInstance?: SuperForm<z.infer<S>>; // Bindable superform instance
		enhancedFormIntegration?: any; // Enhanced form integration instance
	}

	let {
		form: initialForm, // Renamed to avoid conflict with superform instance
		schema,
		action,
		entityName,
		config = {},
		payloadBuilder, // Will be used if provided, otherwise SmartPayloadBuilder logic might be integrated or assumed handled by action
		onSuccess,
		onError,
		onSubmit,
		onCancel,
		superformInstance = $bindable(),
		enhancedFormIntegration
	}: SmartFormProps<AnyZodObject> = $props();

	// Analyze schema to generate base form configuration
	const analyzedFormConfig: AnalyzedFormConfig = SchemaAnalyzer.analyzeSchema(schema);

	// Merge with user-provided overrides from config prop
	const finalFields: AnalyzedFieldConfig[] = analyzedFormConfig.fields
		.map((field) => {
			const override = config.fieldOverrides?.[field.name] as FieldOverride | undefined; // Cast for type safety

			// Determine field type based on overrides
			let fieldType = field.type;
			if (override?.options && override.options.length > 0) {
				// If field has options, use combobox for searchable dropdowns, select for simple ones
				fieldType = override.searchable !== false ? 'combobox' : 'select';
			}

			return {
				...field,
				...(override || {}), // Apply overrides
				type: fieldType, // Override the field type if needed
				// Ensure options from overrides are correctly typed if they exist
				options: override?.options || field.options
			};
		})
		.filter((field) => {
			// Filter out hidden fields, and system fields unless showSystemFields is true
			if (config.fieldOverrides?.[field.name]?.hidden) return false;
			if (['id', 'created_at', 'updated_at'].includes(field.name) && !config.showSystemFields) {
				// Exception: always show 'id' if it has a value (i.e., we are in edit mode)
				return field.name === 'id' && initialForm.data?.id;
			}
			return true;
		})
		.sort((a, b) => {
			// Sort by custom order if specified, otherwise use fieldOverrides order
			const aOrder = config.fieldOverrides?.[a.name]?.order;
			const bOrder = config.fieldOverrides?.[b.name]?.order;

			if (aOrder !== undefined && bOrder !== undefined) {
				return aOrder - bOrder;
			}
			if (aOrder !== undefined) return -1;
			if (bOrder !== undefined) return 1;

			// If no explicit order, use the order from fieldOverrides object
			if (config.fieldOverrides) {
				const overrideKeys = Object.keys(config.fieldOverrides);
				const aIndex = overrideKeys.indexOf(a.name);
				const bIndex = overrideKeys.indexOf(b.name);

				// If both fields are in fieldOverrides, sort by their position
				if (aIndex !== -1 && bIndex !== -1) {
					return aIndex - bIndex;
				}
				// Fields in fieldOverrides come first
				if (aIndex !== -1) return -1;
				if (bIndex !== -1) return 1;
			}

			return 0; // Maintain original order for fields not in fieldOverrides
		});

	const superform = superForm(initialForm, {
		validators: zod(schema), // Pass the Zod schema directly
		resetForm: false, // Or true, depending on desired behavior after success
		taintedMessage: null, // Disable default tainted message, we show our own
		validationMethod: 'auto', // Validate on blur and submit, but not immediately on load
		clearOnSubmit: 'errors-and-message', // Clear errors on successful submit
		delayMs: 300, // Debounce validation
		onSubmit: async (event) => {
			if (onSubmit) {
				await onSubmit(
					event.formData as FormDataFromSchema<AnyZodObject>,
					event.submitter as unknown as SubmitEvent | undefined
				);
			}
			// If a payloadBuilder is provided, it implies custom logic might be needed
			// For now, we assume the default superforms behavior or server-side payload construction
		},
		onResult: ({ result }) => {
			if (result.type === 'success' || result.type === 'redirect') {
				const message = 'data' in result && result.data?.message?.text;
				toast.success(message || `${entityName} saved successfully!`, {
					description: message ? undefined : 'Your changes have been saved.'
				});
				if (onSuccess) onSuccess($formData as FormDataFromSchema<AnyZodObject>);
			} else if (result.type === 'failure') {
				const message = 'data' in result && result.data?.message?.text;
				toast.error(message || `Failed to save ${entityName.toLowerCase()}`, {
					description: message ? undefined : 'Please check the form for errors.'
				});
				if (onError) onError(message || null, superform);
			} else if (result.type === 'error') {
				// Handle general errors
				toast.error(`An unexpected error occurred while saving ${entityName.toLowerCase()}`, {
					description: result.error?.message || 'Please try again.'
				});
				if (onError) onError(result.error?.message || null, superform);
			}
		}
	});

	const { form: formData, enhance, errors, constraints, submitting, tainted, reset } = superform;

	// Connect enhanced form integration if provided
	if (enhancedFormIntegration) {
		enhancedFormIntegration.connectSuperForm(superform);
	}
	// Bind the entire superform instance to the parent component
	superformInstance = superform;

	const layoutClasses = {
		single: 'grid grid-cols-1 gap-4 md:gap-6',
		'two-column': 'grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6',
		'three-column': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'
	};
	const gridClass = layoutClasses[config.layout || 'single'];

	function handleCancel() {
		if (onCancel) {
			onCancel();
		} else if (globalThis.history.length > 1) {
			globalThis.history.back(); // Default cancel behavior
		}
	}
</script>

<form method="POST" {action} use:enhance class="space-y-6">
	{#if config.title || analyzedFormConfig.title}
		<div class="space-y-1">
			<h2 class="text-xl font-semibold tracking-tight">
				{config.title || analyzedFormConfig.title}
			</h2>
			{#if config.description || analyzedFormConfig.description}
				<p class="text-sm text-muted-foreground">
					{config.description || analyzedFormConfig.description}
				</p>
			{/if}
		</div>
	{/if}

	<div class={gridClass}>
		{#each finalFields as field (field.name)}
			<SmartField {field} {superform} bind:value={$formData[field.name]} />
		{/each}
	</div>

	<FormActions
		{entityName}
		isSubmitting={$submitting}
		isDirty={Object.keys($tainted || {}).length > 0}
		onCancel={handleCancel}
	/>
</form>
