import type { Actions } from './$types';

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const email = data.get('test');
		console.log('email', email);
		return;
	}
} satisfies Actions;
