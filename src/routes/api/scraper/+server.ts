import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
interface MyRequestBody {
	source: string;
	barcode: string;
}

export const POST: RequestHandler = async ({ request }) => {
	const apiUrl = 'https://ass-api.tihomir-d4c.workers.dev';
	const body: MyRequestBody = await request.json();
	const response = await fetch(apiUrl, {
		method: 'POST',
		body: JSON.stringify({ source: body.source, barcode: body.barcode }),
		headers: {
			'content-type': 'application/json'
		}
	});

	const href = await response.json();
	console.log(JSON.stringify(href, null, 2));
	return json(href);
};
