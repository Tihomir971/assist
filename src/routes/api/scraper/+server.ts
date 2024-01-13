import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	return new Response();
};
export async function findProductOnWeb(barcode: string | null | undefined, source: string) {
	/*     const apiUrl = 'https://ass-api.tihomir-d4c.workers.dev';
	const response = await fetch(apiUrl, {
		method: 'POST',
		body: JSON.stringify({ source: source, barcode: barcode }),
		headers: {
			'content-type': 'application/json'
		}
	});

	const href = await response.json(); */
	console.log(barcode, source);
}
