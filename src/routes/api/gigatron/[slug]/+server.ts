import { parseHTML } from 'linkedom';
import type { RequestHandler } from './$types';
import { error, json, redirect } from '@sveltejs/kit';

type ParseFunctions = {
	[key: string]: (document: Document) => number;
};

export const GET: RequestHandler = async ({ params, locals: { supabase, getSession } }) => {
	const session = await getSession();
	if (!session) {
		throw redirect(303, '/auth');
	}

	const { data } = await supabase
		.from('m_product_po')
		.select('id,url,c_bpartner_id,m_product(name)')
		//.select('id,parent_id,content: name')
		.eq('m_product_id', params.slug)
		.eq('isactive', true);

	if (data) {
		const prices: number[] = [];
		for (let index = 0; index < data.length; index++) {
			const fetchURL = data[index].url;
			if (fetchURL) {
				const response = await fetch(fetchURL);
				if (!response.ok) {
					throw new Error(`Failed to fetch: ${response.status}`);
				}

				const html = await response.text();
				const { document } = parseHTML(html);
				for (const key in vendorPrice) {
					// Check if the string contains the current key
					if (fetchURL.includes(key)) {
						// If it does, call the corresponding function
						const price = vendorPrice[key](document);

						const { error } = await supabase
							.from('m_product_po')
							.update({ pricelist: price })
							//.select('id,parent_id,content: name')
							.eq('id', data[index].id);

						if (error) {
							throw new Error(`Failed to update: ${error.details}`);
						}
						if (price && price !== 0) prices.push(price);
					}
				}
			}
		}

		let smallestPrice = Math.min(...prices);
		if (!isFinite(smallestPrice)) {
			smallestPrice = 0;
		}

		const result = await supabase
			.from('m_productprice')
			.update({ pricelist: smallestPrice })
			//.select('id,parent_id,content: name')
			.eq('m_product_id', Number(params.slug))
			.eq('m_pricelist_version_id', 15);
		if (result.count === null) {
			const result = await supabase.from('m_productprice').insert({
				m_product_id: Number(params.slug),
				m_pricelist_version_id: 15,
				pricelist: smallestPrice
			});
			//.select('id,parent_id,content: name')
			if (result.error) {
				error(400, `Failed to insert: ${result.error.details}`);
			}
		}

		if (result.error) {
			error(400, `Failed to update: ${result.error.details}`);
		}
		return json(data[0].m_product?.name);

		//return json(parsePrice(html));
	}
	return json('Error');
};

const vendorPrice: ParseFunctions = {
	'gigatron.rs': function (document: Document) {
		const priceElement = document.querySelector<HTMLSpanElement>('.ppra_price-number.snowflake');
		const priceText = priceElement ? priceElement.innerText : null;
		if (priceText) {
			return parseFloat(priceText.replace('.', ''));
		}
		return 0;
	},
	'tehnomedia.rs': function (document: Document) {
		const priceElement = document.querySelector<HTMLElement>('div.price > span > strong');
		const addToCartButton = document.getElementById('add-to-cart-btn');
		const priceText = priceElement ? priceElement.innerText : null;
		if (priceText && addToCartButton) {
			return parseFloat(priceText.replace('.', '').replace(',', '.'));
		}
		return 0;
	},
	'tehnomanija.rs': function (document: Document) {
		const priceElement = document.querySelector('[data-price-amount]');
		const priceAmount = priceElement?.getAttribute('data-price-amount');
		const priceAvailability = document.querySelector('div.stock.unavailable');
		if (priceAmount && !priceAvailability) {
			return Number(priceAmount);
		} else {
			return 0;
		}
	},
	'metalac.com': function (document: Document) {
		const priceElement = document.querySelector<HTMLElement>('span.product-price');
		const priceText = priceElement ? priceElement.innerText : null;
		const priceAvailability = document.querySelector('[data-max-qunatity]');
		const availabilityValue = priceAvailability?.getAttribute('data-max-qunatity');
		if (priceText && availabilityValue !== '0') {
			return parseFloat(priceText.replace('.', ''));
		} else {
			return 0;
		}
	}
};
