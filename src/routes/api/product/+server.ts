import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Mock database query function
async function findProductByGTIN(gtin: string) {
	// TODO: Replace this with actual database query
	const mockProducts = [
		{ gtin: '1234567890123', name: 'Sample Product 1' },
		{ gtin: '2345678901234', name: 'Sample Product 2' }
	];
	return mockProducts.find((p) => p.gtin === gtin) || null;
}

export const GET: RequestHandler = async ({ url }) => {
	const gtin = url.searchParams.get('gtin');

	if (!gtin) {
		return json({ error: 'GTIN parameter is required' }, { status: 400 });
	}

	const product = await findProductByGTIN(gtin);

	if (product) {
		return json(product);
	} else {
		return json({ error: 'Product not found' }, { status: 404 });
	}
};
