import { json } from '@sveltejs/kit';
import * as cheerio from 'cheerio';

export async function GET({ setHeaders }) {
	setHeaders({
		'Acces-Control-Allow-Origin': '*',
		'Cache-Control': `public, s-maxage=${60 * 60 * 24 * 365}`
	});

	const html = await getContributions();
	const $ = cheerio.load(html);

	const priceElement = $('[class^="product_price__"] .text-center');
	const price = priceElement.text().split('RSD')[0].trim();
	console.log(price);

	return json(price);
	/* return json(parseContributions(html)); */
}

async function getContributions() {
	const api = `https://tehnoteka.rs/p/vox-kombinovani-frizider-kk-3300-f-akcija-cena/`;
	const response = await fetch(api);

	if (!response.ok) {
		throw new Error(`Failed to fetch: ${response.status}`);
	}
	return await response.text();
}
