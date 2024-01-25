import { PUBLIC_BEARER_TOKEN } from '$env/static/public';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	const apiUrl = 'https://api.kalisi.rs/bizsoft/assistant/sync/prods';
	const prods: number[] = await request.json();

	const formData = new FormData();
	formData.append('prods', JSON.stringify(prods));

	const myHeaders = new Headers({ Authorization: 'Bearer ' + PUBLIC_BEARER_TOKEN });

	try {
		const response = await fetch(apiUrl, {
			method: 'POST',
			body: formData,
			headers: myHeaders
		});
		if (!response.ok) {
			throw new Error(`Network response was not OK: ${response.statusText}`);
		}

		const data = await response.text();
		return new Response(data);
	} catch (error) {
		if (error instanceof TypeError && error.message === 'Failed to fetch') {
			console.error('Failed to fetch:', error.message);
			return new Response(error.message);
		} else {
			console.error('There has been a problem with your fetch operation:', error);
			return new Response('Shit');
		}
	}
};
