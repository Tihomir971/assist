import { parseHTML } from 'linkedom';
import { error, json, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

type ParseFunctions = {
	[key: string]: (document: Document) => number;
};
type GetApiPrice = {
	[key: string]: (url: string) => Promise<number>;
};

export const GET: RequestHandler = async ({ params, locals: { supabase, getSession } }) => {
	const session = await getSession();
	if (!session) {
		redirect(303, '/auth');
	}

	const { data, error: errorProductPO } = await supabase
		.from('m_product_po')
		.select('id,url,c_bpartner_id,m_product(name)')
		//.select('id,parent_id,content: name')
		.eq('m_product_id', params.slug)
		.eq('isactive', true);

	if (data && data?.length > 0) {
		const prices: number[] = [];
		for (let index = 0; index < data.length; index++) {
			const fetchURL = data[index].url;
			if (fetchURL) {
				//if(fetchURL.includes(key))
				for (const key in getWebPrice) {
					// Check if the string contains the current key
					if (fetchURL.includes(key)) {
						const response = await fetch(fetchURL);
						if (!response.ok) {
							throw new Error(`Failed to fetch: ${response.status}`);
						}
						const html = await response.text();
						const { document } = parseHTML(html);

						// If it does, call the corresponding function
						const price = getWebPrice[key](document);

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
				for (const key in getApiPrice) {
					if (fetchURL.includes(key)) {
						const price = await getApiPrice[key](fetchURL);
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

		const { count, error: errorUpdate } = await supabase
			.from('m_productprice')
			.update({ pricelist: smallestPrice }, { count: 'estimated' })
			//.select('id,parent_id,content: name')
			.eq('m_product_id', Number(params.slug))
			.eq('m_pricelist_version_id', 15);

		if (count === 0) {
			const result = await supabase.from('m_productprice').insert({
				m_product_id: Number(params.slug),
				m_pricelist_version_id: 15,
				pricelist: smallestPrice
			});
			if (result.error) {
				error(400, `Failed to insert: ${result.error.details}`);
			}
		}

		if (errorUpdate) {
			error(400, `Failed to update: ${errorUpdate.details}`);
		}
		return json({ name: data[0].m_product?.name });
	}
	return json(
		errorProductPO
			? { error: errorProductPO }
			: { error: { message: 'No sources', details: 'Sources should be defined first' } }
	);
};

const getWebPrice: ParseFunctions = {
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
	},
	'cenoteka.rs': function (document: Document) {
		//	let tempPrice = [];
		let bestPrice: number | undefined = undefined;
		const priceDivs = document.querySelectorAll('.product_prices_offline_col__KZWlc > div');
		//	const subDivs = parentDiv?.querySelectorAll('div');
		priceDivs?.forEach((div) => {
			const imgElement = div.querySelector('img');
			const sallerName = imgElement?.getAttribute('alt');
			let priceDiv = div.querySelector('.product_action_tooltip__4tt_0');
			if (!priceDiv) priceDiv = div.querySelector('.product_product_price__LLwr_');
			//const price=Number(priceDiv?.replace('.', '').replace(',', '.'));
			const sallerPrice = Number(priceDiv?.textContent?.replace('.', '').replace(',', '.'));

			const sallers = ['Roda', 'Tempo', 'Idea', 'Lidl', 'Maxi'];
			if (sallerName && sallers.includes(sallerName)) {
				if (!bestPrice || sallerPrice < bestPrice) bestPrice = sallerPrice;
			}
		});
		if (bestPrice) return bestPrice;
		return 0;
	}
};

const getApiPrice: GetApiPrice = {
	'online.idea.rs': async function (url: string) {
		const parts = url.split('/');
		const productId = parts[parts.length - 2];
		const myHeaders = new Headers();
		myHeaders.append(
			'Cookie',
			'TS01ad1b17=01d6e88db1da828dd03c7d648b740e123f7acdd0bc098fb5389c3b9f95ffdec6af6521d0b4455b2a6a0fdbe738300108c421c0eefc9fe1cadeebf9f8498375bf737fce5c913cdca95c85e76e2108ebe727819714d23284584052996e5789433162e479f4f8; XSRF-TOKEN=YKrL8F3vgba2PpDyhPwavoyZRMg9c3IUvkm7%2F%2FeMo8Q%3D; _ws-rails_session_id=BAh7DEkiD3Nlc3Npb25faWQGOgZFVEkiJWNiYmQ1MWE5ZTk4ZGI1MTEyZjk3ZjAyMWVjMTkzNmQxBjsAVEkiFWN1cnJlbnRfbG9jYXRpb24GOwBGSSI8aHR0cHM6Ly9vbmxpbmUuaWRlYS5ycy92Mi9wcm9kdWN0cy82MDAwMjY5OT9pZD02MDAwMjY5OQY7AFRJIhhwcm9kdWN0c19zb3J0X2ZpZWxkBjsARkkiCW5hbWUGOwBUSSIXcHJvZHVjdHNfc29ydF90eXBlBjsARkkiCGFzYwY7AFRJIhx0b3BfcHJvZHVjdHNfc29ydF9maWVsZAY7AEZJIg9wb3B1bGFyaXR5BjsAVEkiG3RvcF9wcm9kdWN0c19zb3J0X3R5cGUGOwBGSSIIYXNjBjsAVEkiEF9jc3JmX3Rva2VuBjsARkkiMVlLckw4RjN2Z2JhMlBwRHloUHdhdm95WlJNZzljM0lVdmttNy8vZU1vOFE9BjsARg%3D%3D--a14aeda622c79db55e0840dc4c6529ca98de498b; idea_=rd104o00000000000000000000ffffac100041o80'
		);
		myHeaders.append('Accept', 'application/json');
		myHeaders.append('Content-Type', 'application/json');

		const requestOptions = {
			method: 'GET',
			headers: myHeaders
		};
		const response = await fetch(`https://online.idea.rs/v2/products/${productId}`, requestOptions);
		if (!response.ok) {
			throw new Error(`Network response was not OK: ${response.statusText}`);
		}
		const data = await response.json();
		if (data.active && data.price) {
			return data.price.amount / 100;
		}
		console.log('Product ID:', productId, data.active, data.price);
		return 0;
	},
	'maxi.rs': async function (url: string) {
		const parts = url.split('/');
		const productId = parts[parts.length - 1];
		const myHeaders = new Headers();
		/* 	myHeaders.append(
			'Cookie',
			'_abck=65C139070F738746E76D7FC8E38AC3E9~-1~YAAQRy0UAiH7GJyNAQAAXSs0ngt8cVSbMjK91SghFY1CMzO+a15X3jOulsK8BG8xXgG46cMavJyHFMXuLTILog8SLLGkSoXlcAKtdNh9nrzWhXpwxJCwGDMjJr1E9EBNRgoYZ29gJxS4rznFeHtuwY4P/DCXjPIjViYr0vXHruGwpRjFxo5hjV+lAIz8GMsjnB02uIUnKielAbfJYxuJNGk4h5bv9EjG2rZAQW1SCE2pqMBHYnxYwv551pmMv7jAkWe3pC2klhLft0kZ2yzcYWHLi+xxolXhRUI4T7J0baaI1G0OUhyydi18tU2+E34PqybWpa1i5C3gA5I3IgYacCwZxWk0E+IS2HABXSTopDotK0nZ5I8=~-1~-1~-1; bm_sz=057DB091750AA8F58C5D6ED8ECDA4D0B~YAAQRy0UAiL7GJyNAQAAXSs0nhaoDecPaedmazpCGO7PLw3Alj0SvAAGIcHFlfvINeWcv86MYj8DLl1wMOJ2RVNcFF/0qORYucNtXLdLukt/oVxdmzCsiWzfjP2UykKnNigFPUAb9jSghiHvub1O2rUIgTULhxnNF2dSuCPRbcqyAtwzFYxVywmOGWgxJPeKNn+4T2fP4QHHKLxV6ihxooBiL4qxLR8axo3y7CBIYF3uRn716hXhbBoHbkbudBKhMNhqbepWuAXm8rptwykQ2de5WZVwIgBdNNr6qsJa/ri0iM2HntGJ7qIVWlj0ycfNtdhkDeBTlSvwzds=~3748678~3360310; AWSALB=WtpR76dMMpOLgIVijkS8GxsCcI3LMwX03fdha7hIWzVdss4n3plRDlifqLSBNLLFnxoUiUp7n2nn6MBIndthM2rbykdU1OYQz/+jibjOClp36ECZNMgdt/zaJpGx; AWSALBCORS=WtpR76dMMpOLgIVijkS8GxsCcI3LMwX03fdha7hIWzVdss4n3plRDlifqLSBNLLFnxoUiUp7n2nn6MBIndthM2rbykdU1OYQz/+jibjOClp36ECZNMgdt/zaJpGx; deviceSessionId=fb01f6a4-d4a4-42c7-a349-8947f5462865; grocery-ccatc=2BrYSjEZ6C5X9mb1T6y6fqd5O3s'
		);
		myHeaders.append('Accept', 'application/json');
		myHeaders.append('Content-Type', 'application/json'); */
		const requestOptions = {
			method: 'GET',
			headers: myHeaders
		};
		const variables = { productCode: productId, lang: 'sr' };
		const extensions = {
			persistedQuery: {
				version: 1,
				sha256Hash: 'dab0c62526aa89fb05ac65971e99961476fc100f31abaf875c32534190a497be'
			}
		};
		const apiUrl = new URL('https://www.maxi.rs/api/v1/');
		apiUrl.searchParams.set('operationName', 'ProductDetails');
		apiUrl.searchParams.set('variables', JSON.stringify(variables));
		apiUrl.searchParams.set('extensions', JSON.stringify(extensions));

		const response = await fetch(apiUrl, requestOptions);
		if (!response.ok) {
			throw new Error(`Network response was not OK: ${response.statusText}`);
		}
		const { data } = await response.json();
		const { productDetails } = data;

		if (productDetails.stock.inStock) {
			if (productDetails.price.discountedPriceFormatted) {
				const rsdString = productDetails.price.discountedPriceFormatted;
				const numericValue = parseFloat(rsdString.replace(/[^0-9.]+/g, ''));
				console.log(numericValue);
			} else if (productDetails.price.unitPrice) {
				return productDetails.price.unitPrice;
			}
		}

		return 0;
	}
};
