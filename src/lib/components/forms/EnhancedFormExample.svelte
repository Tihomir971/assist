<script lang="ts">
	import { z } from 'zod';
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import type { SuperValidated } from 'sveltekit-superforms';
	import { createEnhancedFormIntegration, createCrossFieldRules } from '$lib/validation';
	import SmartField from './SmartField.svelte';
	import FormActions from './FormActions.svelte';
	import { toast } from 'svelte-sonner';
	import type { FieldConfig as AnalyzedFieldConfig } from '$lib/utils/schema-analyzer';

	// Example schema for a user registration form
	const userSchema = z.object({
		firstName: z.string().min(2, 'First name must be at least 2 characters'),
		lastName: z.string().min(2, 'Last name must be at least 2 characters'),
		email: z.string().email('Invalid email address'),
		password: z.string().min(8, 'Password must be at least 8 characters'),
		confirmPassword: z.string(),
		age: z.number().min(18, 'Must be at least 18 years old').max(120, 'Invalid age'),
		newsletter: z.boolean().default(false),
		contactMethod: z.enum(['email', 'phone', 'mail']).default('email'),
		phone: z.string().optional(),
		website: z.string().url('Invalid URL').optional()
	});

	type UserFormData = z.infer<typeof userSchema>;

	// Mock initial data
	const initialData: UserFormData = {
		firstName: '',
		lastName: '',
		email: '',
		password: '',
		confirmPassword: '',
		age: 18,
		newsletter: false,
		contactMethod: 'email',
		phone: '',
		website: ''
	};

	// Create a mock SuperValidated instance
	const initialForm: SuperValidated<UserFormData> = {
		id: 'user-form',
		valid: true,
		posted: false,
		errors: {},
		data: initialData,
		constraints: {}
	};

	// Create superform instance
	const form = superForm(initialForm, {
		validators: zod(userSchema),
		onSubmit: async ({ formData }) => {
			console.log('Form submitted:', formData);
			toast.success('Form submitted successfully!');
		}
	});

	const { form: formData, enhance, errors, submitting } = form;

	// Create enhanced form integration
	const formIntegration = createEnhancedFormIntegration({
		schema: userSchema,
		initialData,

		// Auto-save configuration
		autoSave: {
			enabled: true,
			debounceMs: 2000,
			excludeFields: ['password', 'confirmPassword'], // Don't auto-save sensitive fields
			onAutoSave: async (data) => {
				console.log('Auto-saving:', data);
				toast.info('Draft saved automatically');
				// Simulate API call
				await new Promise((resolve) => setTimeout(resolve, 500));
			}
		},

		// Validation configuration
		validateOnChange: true,
		validateOnBlur: true,
		debounceValidationMs: 300,
		enableRealTimeValidation: true,
		validationCaching: true,

		// Cross-field validation rules
		crossFieldRules: [
			// Password confirmation
			createCrossFieldRules.fieldMatch('password', 'confirmPassword', 'Passwords must match'),
			// Conditional phone requirement
			createCrossFieldRules.conditionalRequired(
				'phone',
				'contactMethod',
				'phone',
				'Phone number is required when contact method is phone'
			)
		],

		// Async validation rules
		asyncRules: {
			email: {
				name: 'email_unique',
				validator: async (value) => {
					if (!value || typeof value !== 'string') {
						return {
							isValid: true,
							errors: [],
							fieldName: 'email',
							timestamp: new Date()
						};
					}

					// Simulate API call to check email uniqueness
					await new Promise((resolve) => setTimeout(resolve, 800));
					const exists = value === 'taken@example.com'; // Mock check

					return {
						isValid: !exists,
						errors: exists ? ['Email address is already registered'] : [],
						fieldName: 'email',
						timestamp: new Date()
					};
				},
				debounceMs: 500,
				cacheKey: (value) => `email_${value}`,
				cacheTtlMs: 60000 // Cache for 1 minute
			}
		},

		// Custom messages
		customMessages: {
			firstName: {
				required: 'Please enter your first name',
				min: 'First name is too short'
			},
			email: {
				required: 'Email address is required',
				email: 'Please enter a valid email address'
			}
		},

		// Event handlers
		onValidationStart: (fieldName) => {
			console.log(`Validating ${fieldName}...`);
		},
		onValidationComplete: (fieldName, isValid, errors) => {
			console.log(`Validation complete for ${fieldName}:`, { isValid, errors });
		},
		onFormStateChange: (isDirty, isValid) => {
			console.log('Form state changed:', { isDirty, isValid });
		}
	});

	// Connect with superforms
	formIntegration.connectSuperForm(form as any);

	// Field configurations for SmartField
	const fieldConfigs: AnalyzedFieldConfig[] = [
		{ name: 'firstName', type: 'text', label: 'First Name', required: true, validation: {} },
		{ name: 'lastName', type: 'text', label: 'Last Name', required: true, validation: {} },
		{ name: 'email', type: 'text', label: 'Email Address', required: true, validation: {} },
		{ name: 'password', type: 'text', label: 'Password', required: true, validation: {} },
		{
			name: 'confirmPassword',
			type: 'text',
			label: 'Confirm Password',
			required: true,
			validation: {}
		},
		{ name: 'age', type: 'number', label: 'Age', required: true, validation: {} },
		{
			name: 'newsletter',
			type: 'boolean',
			label: 'Subscribe to Newsletter',
			required: false,
			validation: {}
		},
		{
			name: 'contactMethod',
			type: 'select',
			label: 'Preferred Contact Method',
			required: true,
			validation: {},
			options: [
				{ value: 'email', label: 'Email' },
				{ value: 'phone', label: 'Phone' },
				{ value: 'mail', label: 'Mail' }
			]
		},
		{ name: 'phone', type: 'text', label: 'Phone Number', required: false, validation: {} },
		{ name: 'website', type: 'text', label: 'Website', required: false, validation: {} }
	];

	// Handle field updates
	async function handleFieldUpdate(fieldName: string, value: unknown) {
		await formIntegration.updateField(fieldName, value);
		// Update superform data - let superforms handle the update
	}

	// Handle field blur
	async function handleFieldBlur(fieldName: string) {
		await formIntegration.onFieldBlur(fieldName);
	}

	// Handle form submission
	async function handleSubmit() {
		const validationState = await formIntegration.validateForm();
		if (validationState.isValid) {
			console.log('Form is valid, submitting...');
			formIntegration.markAsSaved();
		} else {
			console.log('Form has validation errors:', validationState);
			toast.error('Please fix validation errors before submitting');
		}
	}

	// Reactive state using Svelte 5 runes
	let formState = $state(formIntegration.formState);
	let validationState = $state(formIntegration.validationState);
	let isDirty = $derived(formState.isDirty);
	let isValid = $derived(formState.isValid);
	let hasUnsavedChanges = $derived(formState.hasUnsavedChanges);
	let isAutoSaving = $derived(formState.isAutoSaving);

	// Update state when form integration changes
	$effect(() => {
		formState = formIntegration.formState;
		validationState = formIntegration.validationState;
	});
</script>

<div class="mx-auto max-w-2xl space-y-6 p-6">
	<div class="space-y-2">
		<h1 class="text-2xl font-bold">Enhanced Form Example</h1>
		<p class="text-muted-foreground">
			Demonstrates advanced form handling with real-time validation, auto-save, and state
			management.
		</p>
	</div>

	<!-- Form State Indicators -->
	<div class="flex flex-wrap gap-2">
		{#if isDirty}
			<span class="rounded bg-yellow-100 px-2 py-1 text-sm text-yellow-800"> Form Modified </span>
		{/if}

		{#if isValid}
			<span class="rounded bg-green-100 px-2 py-1 text-sm text-green-800"> Valid </span>
		{:else}
			<span class="rounded bg-red-100 px-2 py-1 text-sm text-red-800"> Has Errors </span>
		{/if}

		{#if hasUnsavedChanges}
			<span class="rounded bg-orange-100 px-2 py-1 text-sm text-orange-800"> Unsaved Changes </span>
		{/if}

		{#if isAutoSaving}
			<span class="rounded bg-blue-100 px-2 py-1 text-sm text-blue-800"> Auto-saving... </span>
		{/if}

		{#if validationState.isValidating}
			<span class="rounded bg-purple-100 px-2 py-1 text-sm text-purple-800"> Validating... </span>
		{/if}
	</div>

	<!-- Form -->
	<form method="POST" use:enhance onsubmit={handleSubmit} class="space-y-6">
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			{#each fieldConfigs as fieldConfig (fieldConfig.name)}
				{@const fieldName = fieldConfig.name}
				{@const fieldErrors = formIntegration.getFieldErrors(fieldName)}
				{@const isFieldValidating = formIntegration.isFieldValidating(fieldName)}
				{@const isFieldDirty = formIntegration.isFieldDirty(fieldName)}
				{@const isFieldTouched = formIntegration.isFieldTouched(fieldName)}

				<div class="space-y-1">
					<SmartField
						field={fieldConfig}
						bind:value={$formData[fieldName as keyof UserFormData]}
						superform={form as any}
					/>

					<!-- Field state indicators -->
					<div class="flex gap-1 text-xs">
						{#if isFieldValidating}
							<span class="text-blue-600">Validating...</span>
						{/if}
						{#if isFieldDirty}
							<span class="text-yellow-600">Modified</span>
						{/if}
						{#if isFieldTouched}
							<span class="text-gray-500">Touched</span>
						{/if}
					</div>
				</div>
			{/each}
		</div>

		<!-- Global Errors -->
		{#if validationState.globalErrors.length > 0}
			<div class="rounded border border-red-200 bg-red-50 p-4">
				<h3 class="mb-2 font-medium text-red-800">Form Errors:</h3>
				<ul class="list-inside list-disc space-y-1 text-red-700">
					{#each validationState.globalErrors as error}
						<li>{error}</li>
					{/each}
				</ul>
			</div>
		{/if}

		<!-- Form Actions -->
		<FormActions
			entityName="User"
			isSubmitting={$submitting}
			{isDirty}
			onCancel={() => {
				formIntegration.reset();
				toast.info('Form reset to initial state');
			}}
		/>
	</form>

	<!-- Debug Information -->
	<details class="mt-8">
		<summary class="cursor-pointer font-medium">Debug Information</summary>
		<div class="mt-4 space-y-4">
			<div>
				<h3 class="mb-2 font-medium">Form State:</h3>
				<pre class="overflow-auto rounded bg-gray-100 p-3 text-sm">{JSON.stringify(
						formState,
						null,
						2
					)}</pre>
			</div>

			<div>
				<h3 class="mb-2 font-medium">Validation State:</h3>
				<pre class="overflow-auto rounded bg-gray-100 p-3 text-sm">{JSON.stringify(
						validationState,
						null,
						2
					)}</pre>
			</div>

			<div>
				<h3 class="mb-2 font-medium">Form Data:</h3>
				<pre class="overflow-auto rounded bg-gray-100 p-3 text-sm">{JSON.stringify(
						$formData,
						null,
						2
					)}</pre>
			</div>

			<div>
				<h3 class="mb-2 font-medium">Dirty Fields:</h3>
				<pre class="overflow-auto rounded bg-gray-100 p-3 text-sm">{JSON.stringify(
						formIntegration.getDirtyFields(),
						null,
						2
					)}</pre>
			</div>
		</div>
	</details>
</div>

<style>
	/* Add any custom styles here */
</style>
