import { json } from '@sveltejs/kit';
import { parseHTML } from 'linkedom';
//import type { RouteParams } from './$types.js';

export async function GET({ setHeaders }) {
	setHeaders({
		'Acces-Control-Allow-Origin': '*',
		'Cache-Control': `public, s-maxage=${60 * 60 * 24 * 365}`
	});

	const html = await getContributions();
	return json(parseContributions(html));
}

async function getContributions() {
	const api = `https://tehnoteka.rs/p/indesit-zamrzivac-ui6-1-s1-akcija-cena/`;
	const response = await fetch(api);

	if (!response.ok) {
		throw new Error(`Failed to fetch: ${response.status}`);
	}

	return await response.text();
}

function parseContributions(html: string) {
	const { document } = parseHTML(html);

	const contributions = document.querySelectorAll<Element>('header');

	return contributions;
}
