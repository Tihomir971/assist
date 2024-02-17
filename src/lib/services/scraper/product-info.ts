import { parseHTML } from 'linkedom';

import type { Database } from '$lib/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { OrderService } from '../supabase';

type ParseFunctions = {
	[key: string]: (document: Document) => Promise<{
		vendorPrice: number;
		vendorMpn: string | undefined;
		vendorId: string | undefined;
		barcode: string[];
		vendorImages: string[];
		brand: string | undefined;
		vendorPriceEnd: Date | undefined;
	}>;
};
type GetApiInfo = {
	[key: string]: (url: string) => Promise<{
		vendorPrice: number;
		vendorMpn: string | undefined;
		vendorId: string | undefined;
		barcode: string[];
		vendorImages: string[];
		brand: string | undefined;
		vendorPriceEnd: Date | undefined;
	}>;
};
export const getProductInfo = async (supabase: SupabaseClient<Database>, productId: number) => {
	const mpns: string[] = [];
	let barcodes: string[] = [];
	const brands: string[] = [];
	let images: string[] = [];
	const productPurchasing = await OrderService.getProductPurchasing(supabase, productId);

	if (productPurchasing && productPurchasing?.length > 0) {
		const prices: number[] = [];
		for (let index = 0; index < productPurchasing.length; index++) {
			const fetchURL = productPurchasing[index].url;
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
						const data = await getWebPrice[key](document);
						if (data.vendorMpn) {
							mpns.push(data.vendorMpn);
						}
						if (data.brand) {
							brands.push(data.brand);
						}

						barcodes = [...barcodes, ...data.barcode];
						images = [...images, ...data.vendorImages];
						/* 	const { error } = await supabase
							.from('m_product_po')
							.update({ pricelist: price })
							.eq('id', productPurchasing[index].id); */

						/* 		if (error) {
							throw new Error(`Failed to update: ${error.details}`);
						} */
						if (data.vendorPrice && data.vendorPrice !== 0) prices.push(data.vendorPrice);
					}
				}
				for (const key in getApiInfo) {
					if (fetchURL.includes(key)) {
						const apiData = await getApiInfo[key](fetchURL);
						if (apiData.vendorMpn) {
							mpns.push(apiData.vendorMpn);
						}
						if (apiData.brand) {
							brands.push(apiData.brand);
						}

						barcodes = [...barcodes, ...apiData.barcode];
						images = [...images, ...apiData.vendorImages];
						/* 	const { error } = await supabase
							.from('m_product_po')
							.update({ pricelist: apiData.vendorPrice })
							.eq('id', productPurchasing[index].id);
						if (error) {
							throw new Error(`Failed to update: ${error.details}`);
						} */
						if (apiData.vendorPrice && apiData.vendorPrice !== 0) prices.push(apiData.vendorPrice);
					}
				}
			}
		}

		let smallestPrice = Math.min(...prices);
		if (!isFinite(smallestPrice)) {
			smallestPrice = 0;
		}

		/* 		const { count, error: errorUpdate } = await supabase
			.from('m_productprice')
			.update({ pricelist: smallestPrice }, { count: 'estimated' })
			.eq('m_product_id', Number(params.slug))
			.eq('m_pricelist_version_id', 15);
 */
		/* 		if (count === 0) {
			const result = await supabase.from('m_productprice').insert({
				m_product_id: Number(params.slug),
				m_pricelist_version_id: 15,
				pricelist: smallestPrice
			});
			if (result.error) {
				error(400, `Failed to insert: ${result.error.details}`);
			}
		} */

		/* 		if (errorUpdate) {
			error(400, `Failed to update: ${errorUpdate.details}`);
		} */
		//		return json({ name: data[0].m_product?.name });
	}
	/* 	return json(
		errorProductPO
			? { error: errorProductPO }
			: { error: { message: 'No sources', details: 'Sources should be defined first' } }
	); */
	return { mpns, brands, barcodes, images };
};

const getWebPrice: ParseFunctions = {
	/* 	'tehnomedia.rs': function (document: Document) {
		const priceElement = document.querySelector<HTMLElement>('div.price > span > strong');
		const addToCartButton = document.getElementById('add-to-cart-btn');
		const priceText = priceElement ? priceElement.innerText : null;
		if (priceText && addToCartButton) {
			return parseFloat(priceText.replace('.', '').replace(',', '.'));
		}
		return 0;
	}, */
	/* 	'tehnomanija.rs': function (document: Document) {
		const priceElement = document.querySelector('[data-price-amount]');
		const priceAmount = priceElement?.getAttribute('data-price-amount');
		const priceAvailability = document.querySelector('div.stock.unavailable');
		if (priceAmount && !priceAvailability) {
			return Number(priceAmount);
		} else {
			return 0;
		}
	}, */
	/* 	'metalac.com': function (document: Document) {
		const priceElement = document.querySelector<HTMLElement>('span.product-price');
		const priceText = priceElement ? priceElement.innerText : null;
		const priceAvailability = document.querySelector('[data-max-qunatity]');
		const availabilityValue = priceAvailability?.getAttribute('data-max-qunatity');
		if (priceText && availabilityValue !== '0') {
			return parseFloat(priceText.replace('.', ''));
		} else {
			return 0;
		}
	}, */
	/* 	'cenoteka.rs': function (document: Document) {
		let bestPrice: number | undefined = undefined;
		const priceDivs = document.querySelectorAll('.product_prices_offline_col__KZWlc > div');
		priceDivs?.forEach((div) => {
			const imgElement = div.querySelector('img');
			const sallerName = imgElement?.getAttribute('alt');
			let priceDiv = div.querySelector('.product_action_tooltip__4tt_0');
			if (!priceDiv) priceDiv = div.querySelector('.product_product_price__LLwr_');
			const sallerPrice = Number(priceDiv?.textContent?.replace('.', '').replace(',', '.'));

			const sallers = ['Roda', 'Tempo', 'Idea', 'Lidl', 'Maxi'];
			if (sallerName && sallers.includes(sallerName)) {
				if (!bestPrice || sallerPrice < bestPrice) bestPrice = sallerPrice;
			}
		});
		if (bestPrice) return bestPrice;
		return 0;
	} */
};

const getApiInfo: GetApiInfo = {
	'gigatron.rs': async function () {
		//let barcode: string[]=[];
		/* 	let price: number = 0; */
		//		let barcode: string[] = [];
		//let mpn: string = '';
		//let brand: string = '';
		//		let name: string = '';
		/* 		const priceElement = document.querySelector<HTMLSpanElement>('.ppra_price-number');
		const priceText = priceElement ? priceElement.innerText : null;
		if (priceText) {
			price = parseFloat(priceText.replace('.', ''));
		} */
		//		const titleDataElement = document.querySelector('.title-data');

		// Function to get value from a span element
		//		const getValue = (element: Element | null, index: number) => {
		//			const spanElement = element?.querySelector(`span:nth-child(${index})`);

		//			return spanElement
		//				? spanElement.textContent?.trim().split(':')[1].replace(/\s/g, '')
		//				: undefined;
		//		};

		// Assign values only if the elements exist
		//		const mpn = getValue(titleDataElement, 1);
		//		const barcodeData = getValue(titleDataElement, 2);

		//		if (barcodeData !== undefined && barcodeData !== null) {
		//			barcode = [barcodeData];
		//		}
		//		const brand = getValue(titleDataElement, 3);

		// Log the values to verify
		//		console.log('Model:', mpn);
		//		console.log('EAN:', barcode);
		//		console.log('Brand:', brand);
		///
		const myHeaders = new Headers();
		/* 	myHeaders.append(
			'Cookie',
			'PHPSESSID=drkb2tq4r100f74kqbar30r1qo; gigatron_session=a%3A5%3A%7Bs%3A10%3A%22session_id%22%3Bs%3A32%3A%2227482d9f28e410c739f0eaf031255c29%22%3Bs%3A10%3A%22ip_address%22%3Bs%3A13%3A%22109.198.20.10%22%3Bs%3A10%3A%22user_agent%22%3Bs%3A21%3A%22PostmanRuntime%2F7.36.3%22%3Bs%3A13%3A%22last_activity%22%3Bi%3A1708187413%3Bs%3A9%3A%22user_data%22%3Bs%3A0%3A%22%22%3B%7D1abda5faf81782bfd1d31eabe5a46060'
		); */

		const requestOptions = {
			method: 'GET',
			headers: myHeaders
		};
		const response = await fetch(
			'https://api-v2.gigatron.rs/core/product/index/567764',
			requestOptions
		);
		const { items } = await response.json();
		const vendorPrice = parseFloat(items.brand.price);
		const brand = items.brand.name;
		const barcode: string[] = [items.ean];
		const vendorMpn: string = items.model;
		const vendorId: string = items.id;
		const vendorImages: string[] = items.images.map(
			(image: { sizes: { large: string } }) => image.sizes.large
		);
		const vendorPriceEnd = new Date(items.sticker_db.end);

		return { vendorPrice, barcode, brand, vendorMpn, vendorImages, vendorId, vendorPriceEnd };
	}
	/* 	'online.idea.rs': async function (url: string) {
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
	}, */
	/* 	'maxi.rs': async function (url: string) {
		const parts = url.split('/');
		const productId = parts[parts.length - 1];
		const myHeaders = new Headers();
		
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
	} */
};
