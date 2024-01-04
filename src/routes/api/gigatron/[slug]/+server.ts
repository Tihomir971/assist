import { parseHTML } from 'linkedom';
import type { RequestHandler } from './$types';
import { error, json, redirect } from '@sveltejs/kit';

type ParseFunctions = {
	[key: string]: (document: Document) => number | undefined;
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

						if (price) {
							const { error } = await supabase
								.from('m_product_po')
								.update({ pricelist: price })
								//.select('id,parent_id,content: name')
								.eq('id', data[index].id);

							if (error) {
								throw new Error(`Failed to update: ${error.details}`);
							}
							prices.push(price);
						}
					}
				}
			}
		}

		const smallestPrice = Math.min(...prices);
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
		const priceText = priceElement ? priceElement.innerText : 'Price element not found';
		const price = parseFloat(priceText.replace('.', ''));
		return price;
	},
	'tehnomedia.rs': function (document: Document) {
		const priceElement = document.querySelector<HTMLElement>('div.price > span > strong');
		const priceText = priceElement ? priceElement.innerText : 'Price element not found';
		const price = parseFloat(priceText.replace('.', '').replace(',', '.'));
		return price;
	},
	'uspon.rs': function (document: Document) {
		let price: number | undefined = undefined;
		const priceElement = document.querySelector<HTMLElement>('.JSweb_price.price-num.main-price');
		const priceText = priceElement
			? priceElement.getAttribute('data-cena')
			: 'Price element not found';
		if (priceText) {
			price = parseFloat(priceText.replace('.', '').replace(',', '.'));
		}
		return price;
	}
};
