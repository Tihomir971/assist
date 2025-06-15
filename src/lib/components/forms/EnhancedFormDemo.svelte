<script lang="ts">
	import { z } from 'zod';
	import { createEnhancedFormIntegration, createCrossFieldRules } from '$lib/validation';
	import { toast } from 'svelte-sonner';

	// Simple user registration schema
	const userSchema = z.object({
		firstName: z.string().min(2, 'First name must be at least 2 characters'),
		lastName: z.string().min(2, 'Last name must be at least 2 characters'),
		email: z.string().email('Invalid email address'),
		password: z.string().min(8, 'Password must be at least 8 characters'),
		confirmPassword: z.string(),
		age: z.number().min(18, 'Must be at least 18 years old').max(120, 'Invalid age'),
		newsletter: z.boolean().default(false),
		contactMethod: z.enum(['email', 'phone']).default('email'),
		phone: z.string().optional()
	});

	type UserFormData = z.infer<typeof userSchema>;

	// Initial form data
	const initialData: UserFormData = {
		firstName: '',
		lastName: '',
		email: '',
		password: '',
		confirmPassword: '',
		age: 18,
		newsletter: false,
		contactMethod: 'email',
		phone: ''
	};

	// Create enhanced form integration
	const formIntegration = createEnhancedFormIntegration({
		schema: userSchema,
		initialData,

		// Auto-save configuration
		autoSave: {
			enabled: true,
			debounceMs: 2000,
			excludeFields: ['password', 'confirmPassword'],
			onAutoSave: async (data) => {
				console.log('Auto-saving:', data);
				toast.info('Draft saved automatically');
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
			createCrossFieldRules.fieldMatch('password', 'confirmPassword', 'Passwords must match'),
			createCrossFieldRules.conditionalRequired(
				'phone',
				'contactMethod',
				'phone',
				'Phone number is required when contact method is phone'
			)
		],

		// Async validation for email uniqueness
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

					// Simulate API call
					await new Promise((resolve) => setTimeout(resolve, 800));
					const exists = value === 'taken@example.com';

					return {
						isValid: !exists,
						errors: exists ? ['Email address is already registered'] : [],
						fieldName: 'email',
						timestamp: new Date()
					};
				},
				debounceMs: 500,
				cacheKey: (value) => `email_${value}`,
				cacheTtlMs: 60000
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

	// Handle field updates
	async function handleFieldUpdate(fieldName: keyof UserFormData, value: unknown) {
		await formIntegration.updateField(fieldName, value);
	}

	// Handle field blur
	async function handleFieldBlur(fieldName: keyof UserFormData) {
		await formIntegration.onFieldBlur(fieldName);
	}

	// Handle form submission
	async function handleSubmit() {
		const validationState = await formIntegration.validateForm();
		if (validationState.isValid) {
			console.log('Form is valid, submitting...');
			toast.success('Form submitted successfully!');
			formIntegration.markAsSaved();
		} else {
			console.log('Form has validation errors:', validationState);
			toast.error('Please fix validation errors before submitting');
		}
	}

	// Reset form
	function handleReset() {
		formIntegration.reset();
		toast.info('Form reset to initial state');
	}

	// Reactive state using Svelte 5 runes
	let formState = $state(formIntegration.formState);
	let validationState = $state(formIntegration.validationState);
	let formData = $derived(formState.data);
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
		<h1 class="text-2xl font-bold">Enhanced Form Demo</h1>
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
	<form onsubmit={handleSubmit} class="space-y-6">
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<!-- First Name -->
			<div class="space-y-2">
				<label for="firstName" class="block text-sm font-medium"> First Name * </label>
				<input
					id="firstName"
					type="text"
					bind:value={formData.firstName}
					oninput={() => handleFieldUpdate('firstName', formData.firstName)}
					onblur={() => handleFieldBlur('firstName')}
					class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					class:border-red-500={formIntegration.getFieldErrors('firstName').length > 0}
				/>
				{#each formIntegration.getFieldErrors('firstName') as error}
					<p class="text-sm text-red-600">{error}</p>
				{/each}
				<div class="flex gap-2 text-xs">
					{#if formIntegration.isFieldValidating('firstName')}
						<span class="text-blue-600">Validating...</span>
					{/if}
					{#if formIntegration.isFieldDirty('firstName')}
						<span class="text-yellow-600">Modified</span>
					{/if}
				</div>
			</div>

			<!-- Last Name -->
			<div class="space-y-2">
				<label for="lastName" class="block text-sm font-medium"> Last Name * </label>
				<input
					id="lastName"
					type="text"
					bind:value={formData.lastName}
					oninput={() => handleFieldUpdate('lastName', formData.lastName)}
					onblur={() => handleFieldBlur('lastName')}
					class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					class:border-red-500={formIntegration.getFieldErrors('lastName').length > 0}
				/>
				{#each formIntegration.getFieldErrors('lastName') as error}
					<p class="text-sm text-red-600">{error}</p>
				{/each}
			</div>

			<!-- Email -->
			<div class="space-y-2 md:col-span-2">
				<label for="email" class="block text-sm font-medium"> Email Address * </label>
				<input
					id="email"
					type="email"
					bind:value={formData.email}
					oninput={() => handleFieldUpdate('email', formData.email)}
					onblur={() => handleFieldBlur('email')}
					class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					class:border-red-500={formIntegration.getFieldErrors('email').length > 0}
					placeholder="Try 'taken@example.com' to see async validation"
				/>
				{#each formIntegration.getFieldErrors('email') as error}
					<p class="text-sm text-red-600">{error}</p>
				{/each}
				<div class="flex gap-2 text-xs">
					{#if formIntegration.isFieldValidating('email')}
						<span class="text-blue-600">Checking availability...</span>
					{/if}
				</div>
			</div>

			<!-- Password -->
			<div class="space-y-2">
				<label for="password" class="block text-sm font-medium"> Password * </label>
				<input
					id="password"
					type="password"
					bind:value={formData.password}
					oninput={() => handleFieldUpdate('password', formData.password)}
					onblur={() => handleFieldBlur('password')}
					class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					class:border-red-500={formIntegration.getFieldErrors('password').length > 0}
				/>
				{#each formIntegration.getFieldErrors('password') as error}
					<p class="text-sm text-red-600">{error}</p>
				{/each}
			</div>

			<!-- Confirm Password -->
			<div class="space-y-2">
				<label for="confirmPassword" class="block text-sm font-medium"> Confirm Password * </label>
				<input
					id="confirmPassword"
					type="password"
					bind:value={formData.confirmPassword}
					oninput={() => handleFieldUpdate('confirmPassword', formData.confirmPassword)}
					onblur={() => handleFieldBlur('confirmPassword')}
					class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					class:border-red-500={formIntegration.getFieldErrors('confirmPassword').length > 0}
				/>
				{#each formIntegration.getFieldErrors('confirmPassword') as error}
					<p class="text-sm text-red-600">{error}</p>
				{/each}
			</div>

			<!-- Age -->
			<div class="space-y-2">
				<label for="age" class="block text-sm font-medium"> Age * </label>
				<input
					id="age"
					type="number"
					bind:value={formData.age}
					oninput={() => handleFieldUpdate('age', formData.age)}
					onblur={() => handleFieldBlur('age')}
					class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					class:border-red-500={formIntegration.getFieldErrors('age').length > 0}
					min="18"
					max="120"
				/>
				{#each formIntegration.getFieldErrors('age') as error}
					<p class="text-sm text-red-600">{error}</p>
				{/each}
			</div>

			<!-- Contact Method -->
			<div class="space-y-2">
				<label for="contactMethod" class="block text-sm font-medium"> Contact Method * </label>
				<select
					id="contactMethod"
					bind:value={formData.contactMethod}
					onchange={() => handleFieldUpdate('contactMethod', formData.contactMethod)}
					class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				>
					<option value="email">Email</option>
					<option value="phone">Phone</option>
				</select>
			</div>

			<!-- Phone (conditional) -->
			{#if formData.contactMethod === 'phone'}
				<div class="space-y-2 md:col-span-2">
					<label for="phone" class="block text-sm font-medium"> Phone Number * </label>
					<input
						id="phone"
						type="tel"
						bind:value={formData.phone}
						oninput={() => handleFieldUpdate('phone', formData.phone)}
						onblur={() => handleFieldBlur('phone')}
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						class:border-red-500={formIntegration.getFieldErrors('phone').length > 0}
					/>
					{#each formIntegration.getFieldErrors('phone') as error}
						<p class="text-sm text-red-600">{error}</p>
					{/each}
				</div>
			{/if}

			<!-- Newsletter -->
			<div class="space-y-2 md:col-span-2">
				<label class="flex items-center space-x-2">
					<input
						type="checkbox"
						bind:checked={formData.newsletter}
						onchange={() => handleFieldUpdate('newsletter', formData.newsletter)}
						class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
					/>
					<span class="text-sm font-medium">Subscribe to newsletter</span>
				</label>
			</div>
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
		<div class="flex gap-4">
			<button
				type="submit"
				disabled={!isValid}
				class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
			>
				Submit
			</button>
			<button
				type="button"
				onclick={handleReset}
				class="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
			>
				Reset
			</button>
		</div>
	</form>

	<!-- Debug Information -->
	<details class="mt-8">
		<summary class="cursor-pointer font-medium">Debug Information</summary>
		<div class="mt-4 space-y-4">
			<div>
				<h3 class="mb-2 font-medium">Form State:</h3>
				<pre class="overflow-auto rounded bg-gray-100 p-3 text-sm">{JSON.stringify(
						{
							isDirty,
							isValid,
							hasUnsavedChanges,
							isAutoSaving,
							lastSaved: formState.lastSaved,
							lastAutoSave: formState.lastAutoSave
						},
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
						formData,
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
