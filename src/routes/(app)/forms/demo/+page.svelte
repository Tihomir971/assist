<script lang="ts">
	import { z } from 'zod';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	// Enhanced Form Components
	import SmartForm from '$lib/components/forms/SmartForm.svelte';
	import { createEnhancedFormIntegration, createCrossFieldRules } from '$lib/validation';
	import { createFormConfig, fieldConfigs } from '$lib/utils/form-config.builder';

	// UI Components
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';

	// Icons
	import {
		CheckCircle,
		AlertCircle,
		Clock,
		Save,
		RotateCcw,
		Zap,
		Shield,
		Sparkles
	} from '@lucide/svelte/icons';
	import { phase2bCode, traditionalCode } from './text.js';

	let { data } = $props();

	// Demo schemas for different form types
	const userRegistrationSchema = z.object({
		firstName: z.string().min(2, 'First name must be at least 2 characters'),
		lastName: z.string().min(2, 'Last name must be at least 2 characters'),
		email: z.string().email('Invalid email address'),
		password: z.string().min(8, 'Password must be at least 8 characters'),
		confirmPassword: z.string(),
		age: z.number().min(18, 'Must be at least 18 years old').max(120, 'Invalid age'),
		newsletter: z.boolean().default(false),
		contactMethod: z.enum(['email', 'phone', 'sms']).default('email'),
		phone: z.string().optional(),
		bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
		birthDate: z.string().optional(),
		terms: z.boolean().refine((val: boolean) => val === true, 'You must accept the terms')
	});

	const productSchema = z.object({
		name: z.string().min(1, 'Product name is required'),
		description: z.string().optional(),
		price: z.number().min(0, 'Price must be positive'),
		category: z.string().min(1, 'Category is required'),
		inStock: z.boolean().default(true),
		tags: z.string().optional(),
		launchDate: z.string().optional(),
		featured: z.boolean().default(false)
	});

	const settingsSchema = z.object({
		theme: z.enum(['light', 'dark', 'auto']).default('auto'),
		notifications: z.boolean().default(true),
		emailUpdates: z.boolean().default(false),
		language: z.enum(['en', 'es', 'fr', 'de']).default('en'),
		timezone: z.string().default('UTC'),
		autoSave: z.boolean().default(true),
		debugMode: z.boolean().default(false)
	});

	// Type definitions for form data
	type UserFormData = z.infer<typeof userRegistrationSchema>;
	type ProductFormData = z.infer<typeof productSchema>;
	type SettingsFormData = z.infer<typeof settingsSchema>;

	// Initial data for forms
	const userInitialData: UserFormData = {
		firstName: '',
		lastName: '',
		email: '',
		password: '',
		confirmPassword: '',
		age: 18,
		newsletter: false,
		contactMethod: 'email',
		phone: '',
		bio: '',
		birthDate: '',
		terms: false
	};

	const productInitialData: ProductFormData = {
		name: '',
		description: '',
		price: 0,
		category: '',
		inStock: true,
		tags: '',
		launchDate: '',
		featured: false
	};

	const settingsInitialData: SettingsFormData = {
		theme: 'auto',
		notifications: true,
		emailUpdates: false,
		language: 'en',
		timezone: 'UTC',
		autoSave: true,
		debugMode: false
	};

	// Enhanced form integrations
	const userFormIntegration = createEnhancedFormIntegration({
		schema: userRegistrationSchema,
		initialData: userInitialData,
		autoSave: {
			enabled: true,
			debounceMs: 2000,
			excludeFields: ['password', 'confirmPassword'],
			onAutoSave: async (data: any) => {
				console.log('Auto-saving user data:', data);
				toast.info('Draft saved automatically');
				await new Promise((resolve) => setTimeout(resolve, 500));
			}
		},
		validateOnChange: true,
		validateOnBlur: true,
		debounceValidationMs: 300,
		enableRealTimeValidation: true,
		validationCaching: true,
		crossFieldRules: [
			createCrossFieldRules.fieldMatch('password', 'confirmPassword', 'Passwords must match'),
			createCrossFieldRules.conditionalRequired(
				'phone',
				'contactMethod',
				'phone',
				'Phone number is required when contact method is phone'
			)
		],
		asyncRules: {
			email: {
				name: 'email_unique',
				validator: async (value: any) => {
					if (!value || typeof value !== 'string') {
						return {
							isValid: true,
							errors: [],
							fieldName: 'email',
							timestamp: new Date()
						};
					}
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
				cacheKey: (value: any) => `email_${value}`,
				cacheTtlMs: 60000
			}
		},
		onFormStateChange: (isDirty, isValid) => {
			console.log('Demo Page - Form state changed:', { isDirty, isValid });
			// You could update component state here if needed,
			// but for this demo, direct access to userFormIntegration.formState
			// in the template or other $effects is also possible.
		}
	});

	// Enhanced form configurations using the new builder API and span support
	const userFormConfig = createFormConfig<UserFormData>()
		.title('User Registration')
		.description('Create a new user account with enhanced validation and responsive layout')
		.cardProps({
			className: 'max-w-4xl mx-auto',
			showHeader: true,
			showFooter: true
		})
		.gap('md')
		.field('firstName', { span: 6, placeholder: 'Enter your first name' })
		.field('lastName', { span: 6, placeholder: 'Enter your last name' })
		.field('email', { span: 12, placeholder: 'Try "taken@example.com" to see async validation' })
		.field('password', { span: 6 })
		.field('confirmPassword', { span: 6 })
		.field('age', { span: 3 })
		.field('contactMethod', {
			span: 3,
			options: [
				{ value: 'email', label: 'Email' },
				{ value: 'phone', label: 'Phone' },
				{ value: 'sms', label: 'SMS' }
			]
		})
		.field('phone', { span: 6 })
		.field('bio', { span: 12, placeholder: 'Tell us about yourself...' })
		.field('birthDate', { span: 6 })
		.field('newsletter', { span: 3 })
		.field('terms', { span: 12 })
		.build();

	const productFormConfig = createFormConfig<ProductFormData>()
		.title('Product Information')
		.description('Add or edit product details with smart grid layout')
		.cardProps({
			className: 'max-w-6xl mx-auto',
			showHeader: true
		})
		.gap('lg')
		.field('name', { span: 8, placeholder: 'Product name' })
		.field('category', {
			span: 4,
			options: [
				{ value: 'electronics', label: 'Electronics' },
				{ value: 'clothing', label: 'Clothing' },
				{ value: 'books', label: 'Books' },
				{ value: 'home', label: 'Home & Garden' }
			]
		})
		.field('description', { span: 6, placeholder: 'Product description...' })
		.field('price', { span: 3, placeholder: '0.00' })
		.field('inStock', { span: 2 })
		.field('featured', { span: 2 })
		.field('launchDate', { span: 5 })
		.field('tags', { span: 65, placeholder: 'Comma-separated tags' })
		.build();

	const settingsFormConfig = createFormConfig<SettingsFormData>()
		.title('Application Settings')
		.description('Configure your preferences with organized layout')
		.cardProps({
			className: 'max-w-5xl mx-auto'
		})
		.field(
			'theme',
			fieldConfigs.select([
				{ value: 'light', label: 'Light' },
				{ value: 'dark', label: 'Dark' },
				{ value: 'auto', label: 'Auto' }
			])
		)
		.field(
			'language',
			fieldConfigs.select([
				{ value: 'en', label: 'English' },
				{ value: 'es', label: 'Spanish' },
				{ value: 'fr', label: 'French' },
				{ value: 'de', label: 'German' }
			])
		)
		.field('timezone', { placeholder: 'Select timezone' })
		.field('notifications', {})
		.field('emailUpdates', {})
		.field('autoSave', {})
		.field('debugMode', {})
		.build();

	// State management
	let activeTab = $state('overview');
	let demoStats = $state({
		formsCreated: 3,
		validationRules: 12,
		autoSaveEvents: 0,
		validationEvents: 0
	});

	// Update stats when forms are used
	$effect(() => {
		const userState = userFormIntegration.formState;
		const validationState = userFormIntegration.validationState;

		if (userState.lastAutoSave) {
			demoStats.autoSaveEvents++;
		}

		if (validationState.isValidating) {
			demoStats.validationEvents++;
		}
	});

	// Form submission handlers
	function handleUserSubmit(data: any) {
		console.log('Submitting user form:', data);
		toast.success('User registration completed!');
		userFormIntegration.markAsSaved();
	}

	function handleProductSubmit(data: any) {
		console.log('Submitting product form:', data);
		toast.success('Product saved successfully!');
	}

	function handleSettingsSubmit(data: any) {
		console.log('Submitting settings form:', data);
		toast.success('Settings updated!');
	}

	// Bindable superform instances from SmartForm components
	let userSuperform = $state<any>();
	let productSuperform = $state<any>();
	let settingsSuperform = $state<any>();

	// Reset handlers using superform reset
	function resetUserForm() {
		userSuperform?.reset();
	}

	function resetAllForms() {
		userSuperform?.reset();
		productSuperform?.reset();
		settingsSuperform?.reset();
	}
</script>

<div class="container mx-auto space-y-8 overflow-auto py-8">
	<!-- Header -->
	<div class="space-y-4 text-center">
		<div class="flex items-center justify-center gap-2">
			<Sparkles class="h-8 w-8 text-primary" />
			<h1 class="text-4xl font-bold">Phase 2B Enhanced Forms</h1>
		</div>
		<p class="mx-auto max-w-3xl text-xl text-muted-foreground">
			Comprehensive demonstration of advanced form handling with real-time validation, auto-save
			functionality, and intelligent state management.
		</p>

		<!-- Stats -->
		<div class="mt-6 flex justify-center gap-6">
			<div class="text-center">
				<div class="text-2xl font-bold text-primary">{demoStats.formsCreated}</div>
				<div class="text-sm text-muted-foreground">Demo Forms</div>
			</div>
			<div class="text-center">
				<div class="text-2xl font-bold text-green-600">{demoStats.validationRules}</div>
				<div class="text-sm text-muted-foreground">Validation Rules</div>
			</div>
			<div class="text-center">
				<div class="text-2xl font-bold text-blue-600">{demoStats.autoSaveEvents}</div>
				<div class="text-sm text-muted-foreground">Auto-saves</div>
			</div>
			<div class="text-center">
				<div class="text-2xl font-bold text-purple-600">{demoStats.validationEvents}</div>
				<div class="text-sm text-muted-foreground">Validations</div>
			</div>
		</div>
	</div>

	<!-- Feature Highlights -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<Zap class="h-5 w-5" />
				Key Features Demonstrated
			</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div class="flex items-center gap-3 rounded-lg bg-green-50 p-3 dark:bg-green-950">
					<CheckCircle class="h-5 w-5 text-green-600" />
					<div>
						<div class="font-medium">Real-time Validation</div>
						<div class="text-sm text-muted-foreground">Instant feedback</div>
					</div>
				</div>
				<div class="flex items-center gap-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
					<Save class="h-5 w-5 text-blue-600" />
					<div>
						<div class="font-medium">Auto-save</div>
						<div class="text-sm text-muted-foreground">Never lose data</div>
					</div>
				</div>
				<div class="flex items-center gap-3 rounded-lg bg-purple-50 p-3 dark:bg-purple-950">
					<Shield class="h-5 w-5 text-purple-600" />
					<div>
						<div class="font-medium">Schema-driven</div>
						<div class="text-sm text-muted-foreground">Type-safe forms</div>
					</div>
				</div>
				<div class="flex items-center gap-3 rounded-lg bg-orange-50 p-3 dark:bg-orange-950">
					<Clock class="h-5 w-5 text-orange-600" />
					<div>
						<div class="font-medium">Smart State</div>
						<div class="text-sm text-muted-foreground">Intelligent tracking</div>
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Demo Tabs -->
	<Tabs.Root bind:value={activeTab}>
		<Tabs.List class="grid w-full grid-cols-4">
			<Tabs.Trigger value="overview">Overview</Tabs.Trigger>
			<Tabs.Trigger value="user-form">User Registration</Tabs.Trigger>
			<Tabs.Trigger value="product-form">Product Form</Tabs.Trigger>
			<Tabs.Trigger value="settings-form">Settings</Tabs.Trigger>
		</Tabs.List>

		<!-- Overview Tab -->
		<Tabs.Content value="overview" class="space-y-6">
			<Card.Root>
				<Card.Header>
					<Card.Title>Implementation Overview</Card.Title>
					<Card.Description>
						Phase 2B delivers a comprehensive form handling system with 90% code reduction
					</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-6">
					<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
						<div class="space-y-4">
							<h3 class="text-lg font-semibold">Before Phase 2B</h3>
							<div class="rounded-lg bg-red-50 p-4 dark:bg-red-950">
								<ul class="space-y-2 text-sm">
									<li>• Manual form field creation</li>
									<li>• Repetitive validation logic</li>
									<li>• Complex state management</li>
									<li>• No auto-save functionality</li>
									<li>• Limited real-time validation</li>
								</ul>
							</div>
							<Badge variant="destructive">~200 lines per form</Badge>
						</div>
						<div class="space-y-4">
							<h3 class="text-lg font-semibold">After Phase 2B</h3>
							<div class="rounded-lg bg-green-50 p-4 dark:bg-green-950">
								<ul class="space-y-2 text-sm">
									<li>• Schema-driven form generation</li>
									<li>• Automatic validation rules</li>
									<li>• Intelligent state management</li>
									<li>• Built-in auto-save</li>
									<li>• Advanced real-time validation</li>
								</ul>
							</div>
							<Badge variant="default">~20 lines per form</Badge>
						</div>
					</div>

					<Separator />

					<div class="space-y-4">
						<h3 class="text-lg font-semibold">Code Comparison</h3>
						<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
							<div>
								<h4 class="mb-2 font-medium">Traditional Approach</h4>
								<pre
									class="overflow-x-auto rounded-lg bg-muted p-4 text-xs whitespace-pre-wrap">{traditionalCode}</pre>
							</div>
							<div>
								<h4 class="mb-2 font-medium">Phase 2B Approach</h4>
								<pre
									class="overflow-x-auto rounded-lg bg-muted p-4 text-xs whitespace-pre-wrap">{phase2bCode}</pre>
							</div>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<!-- User Registration Form -->
		<Tabs.Content value="user-form" class="space-y-6">
			<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<div class="lg:col-span-2">
					<SmartForm
						form={data.userForm}
						schema={userRegistrationSchema}
						action="?/registerUser"
						entityName="User"
						config={userFormConfig}
						onSuccess={handleUserSubmit}
						bind:superformInstance={userSuperform}
						enhancedFormIntegration={userFormIntegration}
					/>
				</div>
				<div class="space-y-4">
					<Card.Root>
						<Card.Header>
							<Card.Title class="text-lg">Form State</Card.Title>
						</Card.Header>
						<Card.Content class="space-y-3">
							<div class="flex items-center justify-between">
								<span class="text-sm">Dirty</span>
								<Badge variant={userFormIntegration.formState.isDirty ? 'default' : 'secondary'}>
									{userFormIntegration.formState.isDirty ? 'Yes' : 'No'}
								</Badge>
							</div>
							<div class="flex items-center justify-between">
								<span class="text-sm">Valid</span>
								<Badge variant={userFormIntegration.formState.isValid ? 'default' : 'destructive'}>
									{userFormIntegration.formState.isValid ? 'Yes' : 'No'}
								</Badge>
							</div>
							<div class="flex items-center justify-between">
								<span class="text-sm">Auto-saving</span>
								<Badge
									variant={userFormIntegration.formState.isAutoSaving ? 'default' : 'secondary'}
								>
									{userFormIntegration.formState.isAutoSaving ? 'Yes' : 'No'}
								</Badge>
							</div>
							<div class="flex items-center justify-between">
								<span class="text-sm">Unsaved Changes</span>
								<Badge
									variant={userFormIntegration.formState.hasUnsavedChanges
										? 'destructive'
										: 'default'}
								>
									{userFormIntegration.formState.hasUnsavedChanges ? 'Yes' : 'No'}
								</Badge>
							</div>
						</Card.Content>
						<Card.Footer>
							<Button onclick={resetUserForm} variant="outline" size="sm" class="w-full">
								<RotateCcw class="mr-2 h-4 w-4" />
								Reset Form
							</Button>
						</Card.Footer>
					</Card.Root>

					<Card.Root>
						<Card.Header>
							<Card.Title class="text-lg">Features Demonstrated</Card.Title>
						</Card.Header>
						<Card.Content>
							<ul class="space-y-2 text-sm">
								<li class="flex items-center gap-2">
									<CheckCircle class="h-4 w-4 text-green-600" />
									Cross-field validation (password match)
								</li>
								<li class="flex items-center gap-2">
									<CheckCircle class="h-4 w-4 text-green-600" />
									Async validation (email uniqueness)
								</li>
								<li class="flex items-center gap-2">
									<CheckCircle class="h-4 w-4 text-green-600" />
									Conditional fields (phone when contact method = phone)
								</li>
								<li class="flex items-center gap-2">
									<CheckCircle class="h-4 w-4 text-green-600" />
									Auto-save (excludes sensitive fields)
								</li>
								<li class="flex items-center gap-2">
									<CheckCircle class="h-4 w-4 text-green-600" />
									Real-time validation with debouncing
								</li>
							</ul>
						</Card.Content>
					</Card.Root>
				</div>
			</div>
		</Tabs.Content>

		<!-- Product Form -->
		<Tabs.Content value="product-form">
			<SmartForm
				form={data.productForm}
				schema={productSchema}
				action="?/saveProduct"
				entityName="Product"
				config={productFormConfig}
				onSuccess={handleProductSubmit}
				bind:superformInstance={productSuperform}
			/>
		</Tabs.Content>

		<!-- Settings Form -->
		<Tabs.Content value="settings-form">
			<SmartForm
				form={data.settingsForm}
				schema={settingsSchema}
				action="?/saveSettings"
				entityName="Settings"
				config={settingsFormConfig}
				onSuccess={handleSettingsSubmit}
				bind:superformInstance={settingsSuperform}
			/>
		</Tabs.Content>
	</Tabs.Root>

	<!-- Action Buttons -->
	<div class="flex justify-center gap-4">
		<Button onclick={resetAllForms} variant="outline">
			<RotateCcw class="mr-2 h-4 w-4" />
			Reset All Forms
		</Button>
		<Button onclick={() => goto('/catalog')} variant="default">View Live Examples</Button>
	</div>
</div>
