import { parseHTML } from 'linkedom';
import type { RequestHandler, RouteParams } from './$types';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	const html = await getPricePage(params);
	return json(parsePrice(html));
};

async function getPricePage({ slug }: RouteParams) {
	const response = await fetch(slug);

	if (!response.ok) {
		throw new Error(`Failed to fetch: ${response.status}`);
	}

	return await response.text();
}

function parsePrice(html: string) {
	const { document } = parseHTML(html);

	const priceElement = document.querySelector<HTMLSpanElement>('.ppra_price-number.snowflake');
	const price = priceElement ? priceElement.innerText : 'Price element not found';

	console.log('price', price);

	return price;
}
