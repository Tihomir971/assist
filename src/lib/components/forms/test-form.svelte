<script lang="ts">
	import { z } from 'zod';
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import type { SuperValidated } from 'sveltekit-superforms';
	import SmartForm from './SmartForm.svelte';

	// Test schema with all field types
	const testSchema = z.object({
		name: z.string().min(2, 'Name must be at least 2 characters'),
		email: z.string().email('Invalid email address'),
		age: z.number().min(18, 'Must be at least 18').max(100, 'Must be under 100'),
		bio: z.string().optional().describe('Tell us about yourself'),
		isActive: z.boolean().default(false),
		category: z.enum(['personal', 'business', 'other']),
		birthDate: z.date().optional(),
		tags: z.array(z.string()).optional()
	});

	type TestFormData = z.infer<typeof testSchema>;

	// Create form data
	const initialData: TestFormData = {
		name: '',
		email: '',
		age: 25,
		bio: '',
		isActive: false,
		category: 'personal',
		birthDate: undefined,
		tags: []
	};

	// Create a mock SuperValidated instance
	const initialForm: SuperValidated<TestFormData> = {
		id: 'test-form',
		valid: true,
		posted: false,
		errors: {},
		data: initialData,
		constraints: {}
	};

	// Initialize superform
	const superform = superForm(initialForm, {
		SPA: true,
		validators: zod(testSchema),
		onSubmit: ({ formData, cancel }) => {
			console.log('Form submitted:', Object.fromEntries(formData));
			// For testing, just log and cancel actual submission
			cancel();
		}
	});

	const { form: formData } = superform;

	// Smart form configuration
	const smartFormConfig = {
		title: 'Test Form - All Field Types',
		description: 'Testing all smart field components',
		fieldOverrides: {
			category: {
				options: [
					{ value: 'personal', label: 'Personal' },
					{ value: 'business', label: 'Business' },
					{ value: 'other', label: 'Other' }
				]
			},
			bio: {
				placeholder: 'Tell us about yourself...',
				description: 'This will be displayed on your profile'
			},
			isActive: {
				description: 'Enable to activate your account'
			},
			birthDate: {
				description: 'Your date of birth (optional)'
			}
		},
		layout: 'single' as const
	};
</script>

<div class="mx-auto max-w-2xl p-6">
	<h1 class="mb-6 text-2xl font-bold">Smart Form Components Test</h1>

	<SmartForm
		form={initialForm}
		schema={testSchema}
		action="?/test"
		entityName="Test"
		config={smartFormConfig}
	/>

	<div class="mt-8 rounded bg-gray-100 p-4">
		<h3 class="mb-2 font-semibold">Form Data (Live):</h3>
		<pre class="overflow-auto text-sm">{JSON.stringify($formData, null, 2)}</pre>
	</div>
</div>
