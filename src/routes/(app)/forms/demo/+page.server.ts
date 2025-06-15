import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

// Demo schemas matching the client-side schemas
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
	birthDate: z.string().date().optional(),
	terms: z.boolean().refine((val) => val === true, 'You must accept the terms')
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

export const load: PageServerLoad = async () => {
	// Initialize forms without pre-validation to avoid showing errors on load
	const userForm = await superValidate(zod(userRegistrationSchema), {
		errors: false // Don't validate on initialization
	});

	const productForm = await superValidate(zod(productSchema), {
		errors: false // Don't validate on initialization
	});

	const settingsForm = await superValidate(zod(settingsSchema), {
		errors: false // Don't validate on initialization
	});

	return {
		userForm,
		productForm,
		settingsForm
	};
};

export const actions: Actions = {
	registerUser: async ({ request }) => {
		const form = await superValidate(request, zod(userRegistrationSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		// Simulate user registration
		console.log('Registering user:', form.data);

		// Add a small delay to simulate processing
		await new Promise((resolve) => setTimeout(resolve, 1000));

		return {
			form,
			message: { text: 'User registered successfully!' }
		};
	},

	saveProduct: async ({ request }) => {
		const form = await superValidate(request, zod(productSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		// Simulate product save
		console.log('Saving product:', form.data);

		await new Promise((resolve) => setTimeout(resolve, 500));

		return {
			form,
			message: { text: 'Product saved successfully!' }
		};
	},

	saveSettings: async ({ request }) => {
		const form = await superValidate(request, zod(settingsSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		// Simulate settings save
		console.log('Saving settings:', form.data);

		await new Promise((resolve) => setTimeout(resolve, 300));

		return {
			form,
			message: { text: 'Settings updated successfully!' }
		};
	}
};
