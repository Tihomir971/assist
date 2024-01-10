import { json, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import puppeteer from 'puppeteer-extra';
import Adblocker from 'puppeteer-extra-plugin-adblocker';

puppeteer.use(Adblocker({ blockTrackers: true }));

type ParseFunctions = {
	[key: string]: (barcode: string) => Promise<string>;
};

export const POST: RequestHandler = async ({ request, locals: { getSession } }) => {
	const session = await getSession();
	if (!session) {
		throw redirect(303, '/auth');
	}
	const body = await request.json();
	const href = await vendorPrice.cenoteka(body.barcode);
	console.log('API href', href);

	return json(href);
};

const vendorPrice: ParseFunctions = {
	cenoteka: async function (barcode: string) {
		let href = '';
		console.log('barcode', barcode);

		const browser = await puppeteer.launch({ headless: false });
		const page = await browser.newPage();
		await page.goto('https://cenoteka.rs/');

		// Wait for suggest overlay to appear and click "show all results".
		const homeSearchSelector = '.nav_search_input__CB_KM';
		await page.waitForSelector(homeSearchSelector);
		await page.click(homeSearchSelector);

		// Wait for the results page to load and display the results.
		const innerSearchSelector = '#nav-search';
		await page.waitForSelector(innerSearchSelector);
		await page.type(innerSearchSelector, barcode);

		const searchResultSelector =
			'#__next > div > form > div.search_search_content_wrap__Ab4ZA.container > div.row.pt-4.pb-1 > div > div > a';
		await page.waitForSelector(searchResultSelector);
		href = await page.$eval(searchResultSelector, (elm) => elm.href);

		await browser.close();

		return href;
	}
};
