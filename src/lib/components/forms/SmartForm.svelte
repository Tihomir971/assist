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

	// Merge with user-provided overrides from config prop
	const finalFields: EnhancedFieldConfig[] = analyzedFormConfig.fields
		.map((field) => {
			const override = config.fieldOverrides?.[field.name] as FieldOverride | undefined; // Cast for type safety

			// Determine field type based on overrides
			let fieldType = field.type;

			// Priority 1: Manual type override
			if (override?.type) {
				fieldType = override.type;
			}
			// Priority 2: Options-based type detection
			else if (override?.options && override.options.length > 0) {
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
			// Always include id field if it has a value (needed for updates and deletes)
			if (field.name === 'id' && initialForm.data?.id) {
				return true;
			}

			// Exclude id field when there's no value (create mode)
			if (field.name === 'id' && !initialForm.data?.id) {
				return false;
			}

			// Filter out other hidden fields
			if (config.fieldOverrides?.[field.name]?.hidden) return false;

			// Note: created_at and updated_at are now shown as readonly fields but excluded from submission by SmartPayloadBuilder

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
				<Card.Title>
					{config.title || analyzedFormConfig.title}
				</Card.Title>
				{#if config.description || analyzedFormConfig.description}
					<Card.Description>
						{config.description || analyzedFormConfig.description}
					</Card.Description>
				{/if}
				<Card.Action>
					<FormActions
						{entityName}
						isSubmitting={$submitting}
						isDirty={Object.keys($tainted || {}).length > 0}
						onCancel={handleCancel}
						{onDelete}
						{deleteAction}
						showDelete={!!deleteAction}
						hasId={!!initialForm.data?.id}
						{formElement}
					/>
				</Card.Action>
			</Card.Header>
		{/if}

		<Card.Content>
			<!-- Hidden fields (rendered outside grid to avoid taking up space) -->
			{#each finalFields.filter((f) => f.hidden) as field (field.name)}
				<SmartField {field} {superform} bind:value={$formData[field.name]} />
			{/each}

			<!-- Visible fields (rendered in grid) -->
			<div class={gridClass}>
				{#each finalFields.filter((f) => !f.hidden) as field (field.name)}
					<div class={getFieldSpanClass(field.span)}>
						<SmartField {field} {superform} bind:value={$formData[field.name]} />
					</div>
				{/each}
			</div>
			<SuperDebug data={{ $formData, $errors }} display={dev} />
		</Card.Content>
	</Card.Root>
</form>
