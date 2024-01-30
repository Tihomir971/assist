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
	//	console.log('response.status', JSON.stringify(response));

	if (response.status === 200) {
		const href = await response.json();
		return json(href);
	}
	//return json(null, { status: 204 });
	return new Response(null, { status: 204 });
};
