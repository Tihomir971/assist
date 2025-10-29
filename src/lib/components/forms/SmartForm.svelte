<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { SuperValidated, SuperForm } from 'sveltekit-superforms';
	import type { ZodObject, z, ZodType } from 'zod';
	import type { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder';
	import type { SmartFormConfig, FieldOverride } from '$lib/types/form-config.types';
	import {
		SchemaAnalyzer,
		type FormConfig as AnalyzedFormConfig,
		type FieldConfig as AnalyzedFieldConfig
	} from '$lib/utils/schema-analyzer';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { toastManager } from '$lib/utils/toast-manager';

	// UI Components
	import * as Card from '$lib/components/ui/card/index.js';
	import SmartField from './SmartField.svelte'; // This will be created next (Day 3)
	import FormActions from './FormActions.svelte';
	import { dev } from '$app/environment';

	// Define a more specific type for form data, inferring from Zod schema
	type FormDataFromSchema<S extends ZodType<any, any>> = z.infer<S>;

	interface SmartFormProps<S extends ZodObject<any>> {
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
	}: SmartFormProps<ZodObject<any>> = $props();

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

			// Extract componentProps before using it
			const { componentProps, ...overrideWithoutProps } = override;

			// Determine the final field type
			let fieldType = override.type || baseField.type;
			if (!override.type && (componentProps as any)?.options?.length) {
				fieldType = (componentProps as any).searchable !== false ? 'combobox' : 'select';
			}

			// Merge base field with override, keeping componentProps separate
			acc.push({
				...baseField,
				...overrideWithoutProps,
				type: fieldType,
				// options: (componentProps as any)?.options || baseField.options,
				// Only keep componentProps as a nested object, don't spread to top level
				componentProps
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
		validators: zod4(schema), // Pass the Zod schema directly
		resetForm: false, // Or true, depending on desired behavior after success
		taintedMessage: null, // Disable default tainted message, we show our own
		validationMethod: 'auto', // Validate on blur and submit, but not immediately on load
		clearOnSubmit: 'errors-and-message', // Clear errors on successful submit
		delayMs: 150, // Reduced debounce validation to prevent setTimeout violations
		dataType: 'json', // Use JSON to handle nested data structures
		onSubmit: async (event) => {
			// Remove system timestamp fields and lookup object fields from form submission
			const fieldsToRemove = ['created_at', 'updated_at'];

			// Also remove any fields that contain objects (lookup data)
			for (const [key, value] of event.formData.entries()) {
				if (typeof value === 'string' && value === '[object Object]') {
					fieldsToRemove.push(key);
				}
			}

			fieldsToRemove.forEach((fieldName) => {
				if (event.formData.has(fieldName)) {
					event.formData.delete(fieldName);
				}
			});

			// Clean up empty string values for optional fields
			for (const [key, value] of Array.from(event.formData.entries())) {
				if (typeof value === 'string') {
					// Remove empty string values for id field (let server assign)
					if (key === 'id' && value === '') {
						event.formData.delete(key);
					}
					// Remove empty string values for optional numeric fields
					else if (key === 'sequence' && value === '') {
						event.formData.delete(key);
					}
				}
			}

			if (onSubmit) {
				await onSubmit(
					event.formData as unknown as FormDataFromSchema<ZodObject<any>>,
					event.submitter as unknown as SubmitEvent | undefined
				);
			}
		},
		onResult: ({ result }) => {
			if (result.type === 'success') {
				if (result.data?.success) {
					const operation = result.data.operation || 'save';
					const message =
						operation === 'create'
							? `${entityName} created successfully!`
							: operation === 'update'
								? `${entityName} updated successfully!`
								: operation === 'delete'
									? `${entityName} deleted successfully!`
									: `${entityName} saved successfully!`;

					toastManager.showSuccess(message, {
						dedupeKey: `${entityName.toLowerCase()}-${operation}-success`
					});

					// Pass the form data which now contains the updated entity data from the server
					if (onSuccess) onSuccess($formData as unknown as FormDataFromSchema<ZodObject<any>>);
				}
			} else if (result.type === 'redirect') {
				// Handle redirects - typically after successful delete operations
				// Don't show toast here as the redirect will handle the feedback
				// The redirect usually goes to a list page which should show its own success message
				if (onSuccess) onSuccess($formData as unknown as FormDataFromSchema<ZodObject<any>>);
			} else if (result.type === 'failure') {
				const operation = result.data?.operation || 'save';

				// Check if we have structured error data
				if (result.data?.isStructuredError && result.data?.errorTitle) {
					toastManager.showStructuredError(
						{
							title: result.data.errorTitle,
							details: result.data.error || `Failed to ${operation} ${entityName.toLowerCase()}`,
							constraint: result.data.errorConstraint,
							suggestion: result.data.errorSuggestion
						},
						undefined,
						{
							dedupeKey: `${entityName.toLowerCase()}-${operation}-structured-error-${result.data.errorConstraint || 'unknown'}`
						}
					);
				} else {
					// Fallback to simple error message
					const errorMessage = result.data?.error || `Failed to save ${entityName.toLowerCase()}`;
					toastManager.showError(errorMessage, {
						dedupeKey: `${entityName.toLowerCase()}-${operation}-error-${errorMessage.slice(0, 20)}`
					});
				}

				if (onError) onError(result.data?.error || null, superform);
			} else if (result.type === 'error') {
				toastManager.showError(
					`An unexpected error occurred while saving ${entityName.toLowerCase()}`,
					{ dedupeKey: `${entityName.toLowerCase()}-unexpected-error` }
				);

				if (onError) onError(result.error?.message || null, superform);
			}
		}
	});

	const { form: formData, enhance, errors, constraints, submitting, tainted, reset } = superform;

	const finalTitle = $derived(
		`${$formData.id ? 'Edit' : 'Create'} ${config.title || analyzedFormConfig.title}`
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

	// Clean up enhanced form integration on component destroy
	onDestroy(() => {
		if (enhancedFormIntegration && typeof enhancedFormIntegration.destroy === 'function') {
			enhancedFormIntegration.destroy();
		}
	});

	// When a new form object is passed, reset the form to reflect the new data.
	// This is crucial for the SmartRelatedDrawer to update the form for editing.
	// Only reset if the form ID has changed or if form is currently pristine
	$effect(() => {
		if (initialForm && $formData.id !== initialForm.data?.id) {
			reset(initialForm);
		}
	});

	// Simplified 12-column responsive grid system
	const getGridClasses = () => {
		const baseClasses = 'grid grid-cols-1 md:grid-cols-12';
		const gapClass = config.gap
			? `gap-${config.gap === 'sm' ? '2' : config.gap === 'lg' ? '8' : '4'}`
			: 'gap-4 md:gap-3';

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
