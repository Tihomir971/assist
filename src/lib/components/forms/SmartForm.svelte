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
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';

	// UI Components
	import * as Card from '$lib/components/ui/card/index.js';
	import SmartField from './SmartField.svelte'; // This will be created next (Day 3)
	import FormActions from './FormActions.svelte';
	import { dev } from '$app/environment';

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
		onDelete?: () => void;
		deleteAction?: string; // Form action for delete (e.g., "?/categoryDelete")
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
		onDelete,
		deleteAction,
		superformInstance = $bindable(),
		enhancedFormIntegration
	}: SmartFormProps<AnyZodObject> = $props();

	// Enhanced field config type that includes span and other overrides
	type EnhancedFieldConfig = AnalyzedFieldConfig & FieldOverride;

	// Analyze schema to generate base form configuration
	const analyzedFormConfig: AnalyzedFormConfig = SchemaAnalyzer.analyzeSchema(schema);

	// Create a map of analyzed fields for easy lookup
	const analyzedFieldsMap = new Map(analyzedFormConfig.fields.map((f) => [f.name, f]));

	// Build the list of VISIBLE fields based on the provided config using reduce to avoid type issues
	const visibleFields: EnhancedFieldConfig[] = Object.entries(config.fieldOverrides || {})
		.reduce<EnhancedFieldConfig[]>((acc, [fieldName, override]) => {
			const baseField = analyzedFieldsMap.get(fieldName);
			// Skip if field not in schema or explicitly hidden
			if (!baseField || override.hidden) {
				return acc;
			}

			// Determine the final field type
			let fieldType = override.type || baseField.type;
			if (!override.type && override.options?.length) {
				fieldType = override.searchable !== false ? 'combobox' : 'select';
			}

			acc.push({
				...baseField,
				...override,
				type: fieldType,
				options: override.options || baseField.options
			});
			return acc;
		}, [])
		.sort((a, b) => {
			// Sort fields based on the order they appear in the config.fieldOverrides object
			if (config.fieldOverrides) {
				const keys = Object.keys(config.fieldOverrides);
				return keys.indexOf(a.name) - keys.indexOf(b.name);
			}
			return 0;
		});

	const superform = superForm(initialForm, {
		validators: zod(schema), // Pass the Zod schema directly
		resetForm: false, // Or true, depending on desired behavior after success
		taintedMessage: null, // Disable default tainted message, we show our own
		validationMethod: 'auto', // Validate on blur and submit, but not immediately on load
		clearOnSubmit: 'errors-and-message', // Clear errors on successful submit
		delayMs: 300, // Debounce validation
		dataType: 'form', // Ensure we're working with FormData
		onSubmit: async (event) => {
			// Remove only system timestamp fields from form submission
			// (id field is kept as it's needed for updates and deletes)
			const systemTimestampFields = ['created_at', 'updated_at'];
			systemTimestampFields.forEach((fieldName) => {
				if (event.formData.has(fieldName)) {
					event.formData.delete(fieldName);
				}
			});

			if (onSubmit) {
				await onSubmit(
					event.formData as FormDataFromSchema<AnyZodObject>,
					event.submitter as unknown as SubmitEvent | undefined
				);
			}
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

	const finalTitle = $derived(
		`${$formData.id ? 'Update' : 'Create'} ${config.title || analyzedFormConfig.title}`
	);

	// Determine which fields should be HIDDEN inputs
	const visibleFieldNames = new Set(visibleFields.map((f) => f.name));
	const hiddenFieldNames = $derived(
		Object.keys($formData).filter((key) => !visibleFieldNames.has(key))
	);

	// Connect enhanced form integration if provided
	if (enhancedFormIntegration) {
		enhancedFormIntegration.connectSuperForm(superform);
	}
	// Bind the entire superform instance to the parent component
	superformInstance = superform;

	// When a new form object is passed, reset the form to reflect the new data.
	// This is crucial for the SmartRelatedDrawer to update the form for editing.
	$effect(() => {
		if (initialForm) {
			reset(initialForm);
		}
	});

	// Simplified 12-column responsive grid system
	const getGridClasses = () => {
		const baseClasses = 'grid grid-cols-1 md:grid-cols-12';
		const gapClass = config.gap
			? `gap-${config.gap === 'sm' ? '2' : config.gap === 'lg' ? '8' : '4'}`
			: 'gap-4 md:gap-6';

		return `${baseClasses} ${gapClass}`;
	};

	// Calculate field span classes for 12-column grid
	const getFieldSpanClass = (span?: number) => {
		if (!span) return 'col-span-1 md:col-span-12'; // Default to full width

		// Use explicit class mapping to ensure Tailwind includes these classes
		const spanClasses: Record<number, string> = {
			1: 'col-span-1 md:col-span-1',
			2: 'col-span-1 md:col-span-2',
			3: 'col-span-1 md:col-span-3',
			4: 'col-span-1 md:col-span-4',
			5: 'col-span-1 md:col-span-5',
			6: 'col-span-1 md:col-span-6',
			7: 'col-span-1 md:col-span-7',
			8: 'col-span-1 md:col-span-8',
			9: 'col-span-1 md:col-span-9',
			10: 'col-span-1 md:col-span-10',
			11: 'col-span-1 md:col-span-11',
			12: 'col-span-1 md:col-span-12'
		};

		return spanClasses[span] || 'col-span-1 md:col-span-12';
	};

	const gridClass = getGridClasses();

	// Form reference for delete functionality
	let formElement: HTMLFormElement | undefined = $state();

	function handleCancel() {
		if (onCancel) {
			onCancel();
		} else if (globalThis.history.length > 1) {
			globalThis.history.back(); // Default cancel behavior
		}
	}
</script>

<!-- Card Wrapper with Form -->
<form method="POST" {action} use:enhance bind:this={formElement}>
	<Card.Root class={config.cardProps?.className}>
		{#if config.cardProps?.showHeader !== false && (config.title || analyzedFormConfig.title)}
			<Card.Header class="border-b">
				<div class="flex items-center justify-between">
					<Card.Title class="text-xl font-semibold">{finalTitle}</Card.Title>
					<Card.Action>
						<FormActions
							{entityName}
							isSubmitting={$submitting}
							isDirty={Object.keys($tainted || {}).length > 0}
							onCancel={handleCancel}
							onReset={reset}
							{onDelete}
							{deleteAction}
							showDelete={!!deleteAction}
							hasId={!!initialForm.data?.id}
							{formElement}
						/>
					</Card.Action>
				</div>
				{#if config.description || analyzedFormConfig.description}
					<Card.Description class="mt-1">
						{config.description || analyzedFormConfig.description}
					</Card.Description>
				{/if}
			</Card.Header>
		{/if}

		<Card.Content>
			<!-- Automatically render hidden inputs for data not in the visible form -->
			{#each hiddenFieldNames as fieldName (fieldName)}
				<input type="hidden" name={fieldName} value={$formData[fieldName] ?? ''} />
			{/each}

			<!-- Visible fields (rendered in grid) -->
			<div class={gridClass}>
				{#each visibleFields as field (field.name)}
					<div class={getFieldSpanClass(field.span)}>
						<SmartField {field} {superform} bind:value={$formData[field.name]} />
					</div>
				{/each}
			</div>
			<SuperDebug data={{ $formData, $errors }} display={dev} />
		</Card.Content>
	</Card.Root>
</form>
