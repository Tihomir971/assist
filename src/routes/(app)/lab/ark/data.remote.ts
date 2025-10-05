import { form, query } from '$app/server';
import * as v from 'valibot';
import * as z from 'zod';

// User type definition
export interface User {
	id: number;
	name: string;
	email: string;
	avatar: string;
}

const allUsers = [
	{ id: 1, name: 'John Doe', email: 'john@example.com', avatar: 'JD' },
	{ id: 2, name: 'Jane Smith', email: 'jane@example.com', avatar: 'JS' },
	{ id: 3, name: 'Bob Johnson', email: 'bob@example.com', avatar: 'BJ' },
	{ id: 4, name: 'Alice Brown', email: 'alice@example.com', avatar: 'AB' },
	{
		id: 5,
		name: 'Charlie Wilson',
		email: 'charlie@example.com',
		avatar: 'CW'
	},
	{ id: 6, name: 'Diana Davis', email: 'diana@example.com', avatar: 'DD' }
];

export const searchUsers = query(z.string(), async (input) => {
	console.log('Searching for:', input);
	await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay

	if (!input) return [];

	return allUsers.filter(
		(user) =>
			user.name.toLowerCase().includes(input.toLowerCase()) ||
			user.email.toLowerCase().includes(input.toLowerCase())
	);
});

export const createPost = form(
	/* z.object({
		title: z.string().transform((s) => parseFloat(s)),
		content: z.string().optional()
	}), */
	v.object({
		title: v.pipe(
			v.string(),
			v.transform((s) => Number(s)),
			v.number()
		),
		content: v.pipe(v.string(), v.nonEmpty())
	}),
	async ({ title, content }) => {
		console.log('Form data received:', { title, content });
		// Check the user is logged in
		// const user = await auth.getUser();
		// if (!user) error(401, 'Unauthorized');

		// Insert into the database
		// await db.sql`
		// 	INSERT INTO post (slug, title, content)
		// 	VALUES (${slug}, ${title}, ${content})
		// `;

		// Redirect to the newly created page
		return { success: true };
		// redirect(303, `/blog/${slug}`);
	}
);
