import { query } from '$app/server';

export const getPost = query('unchecked', async (param: number) => {
	console.log('Getting post for:', param);
	return {
		id: param,
		title: `Post ${param}`,
		content: `This is the content for post ${param}`,
		value: param + 1,
		timestamp: new Date().toISOString()
	};
});
