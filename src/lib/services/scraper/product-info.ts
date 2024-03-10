import { parseHTML } from 'linkedom';

import type { Database } from '$lib/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { OrderService } from '../supabase';

type VendorProduct = {
	po_id?: number;
	c_bpartner_id: number;
	name: string;
	price: number | null;
	mpn: string | null;
	sku: string | null;
	barcode: string[];
	images: string[];
	brand: string | null;
	vendorPriceEnd: Date | null;
	onStock: boolean | null;
};
type ParseFunctions = {
	[key: string]: (document: Document) => Promise<VendorProduct>;
};
type GetApiInfo = {
	[key: string]: (url: string) => Promise<VendorProduct>;
};
export const getProductInfo = async (supabase: SupabaseClient<Database>, productId: number) => {
	const vendorsProduct: VendorProduct[] = [];
	const productPurchasing = await OrderService.getProductPurchasing(supabase, productId);

	if (productPurchasing && productPurchasing?.length > 0) {
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
						const webData = await getWebPrice[key](document);
						if (webData) {
							webData.po_id = productPurchasing[index].id;
							vendorsProduct.push(webData);
						}
					}
				}
				for (const key in getApiInfo) {
					if (fetchURL.includes(key)) {
						const apiData = await getApiInfo[key](fetchURL);
						if (apiData) {
							apiData.po_id = productPurchasing[index].id;
							vendorsProduct.push(apiData);
						}
					}
				}
			}
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

	const { data } = await supabase
		.from('m_product')
		.select('name')
		.eq('id', productId)
		.maybeSingle();

	return { name: data?.name, vendorsProduct };
};

const getWebPrice: ParseFunctions = {
	'tehnomedia.rs': async function (document: Document) {
		const vendorData: VendorProduct = {
			c_bpartner_id: 6,
			name: 'tehnomedia',
			price: null,
			barcode: [],
			brand: null,
			mpn: null,
			images: [],
			sku: null,
			vendorPriceEnd: null,
			onStock: null
		};
		const priceElement = document.querySelector<HTMLElement>('div.price > span > strong');
		const addToCartButton = document.getElementById('add-to-cart-btn');
		const priceText = priceElement ? priceElement.innerText : null;
		if (priceText && addToCartButton) {
			vendorData.price = parseFloat(priceText.replace('.', '').replace(',', '.'));
		}
		vendorData.sku = document?.querySelector('.sifra')?.textContent ?? null;
		// Try to find ean
		const eanElement = document.getElementById('flixdataTM')?.getAttribute('data-flix-ean');
		if (eanElement) {
			vendorData.barcode = [eanElement];
		}
		const brandElement = document.querySelector('.proizvodjac')?.textContent;
		if (brandElement) {
			vendorData.brand = brandElement;
		}
		// Find images
		const aElements = document.querySelectorAll('a[data-pswp-width]');
		aElements.forEach((el) => {
			const imagePath = el.getAttribute('href');
			if (imagePath) {
				vendorData.images.push(imagePath);
			}
		});

		const outOfStockDivElement = document.querySelector('.add-to-cart.add-archive');
		vendorData.onStock = outOfStockDivElement ? false : true;

		return vendorData;
	},
	'tehnomanija.rs': async function (document: Document) {
		const vendorData: VendorProduct = {
			c_bpartner_id: 8,
			name: 'tehnomanija',
			price: null,
			barcode: [],
			brand: null,
			mpn: null,
			images: [],
			sku: null,
			vendorPriceEnd: null,
			onStock: null
		};

		const addButton = document.getElementById('product-addtocart-button');

		if (addButton) {
			const dataBrand = addButton.getAttribute('data-brand');

			if (dataBrand) {
				vendorData.brand = dataBrand;
			}
		}

		const skuElement = document.querySelector<HTMLDivElement>('.product.attribute.sku .value');
		if (skuElement) {
			// Extracting the content of the value div
			const skuValue = skuElement.textContent;

			if (skuValue) {
				vendorData.sku = skuValue;
			}
		}
		const metaElement = document.querySelector<HTMLMetaElement>(
			'meta[property="product:price:amount"]'
		);
		if (metaElement) {
			// Extracting the content attribute value and converting it to a number
			vendorData.price = Number(metaElement.content);
		}
		const dateElement = document.querySelector<HTMLDivElement>('.action_to');
		if (dateElement) {
			// Extracting the content of the div element
			const dateString = dateElement.textContent;
			if (dateString) {
				const [day, month, year] = dateString.split('.').map(Number);

				vendorData.vendorPriceEnd = new Date(year, month - 1, day);
			}
			// Converting the extracted string to a Date object
			//vendorData.vendorPriceEnd = dateString ? new Date(dateString) : null;
		}
		/* const priceElement = document.querySelector('[data-price-amount]');
		const priceAmount = priceElement?.getAttribute('data-price-amount');*/
		const availabilityElement = document.querySelector<HTMLDivElement>('div[title="Availability"]');
		if (availabilityElement) {
			// Check if the element has either class "stock unavailable" or "stock available"
			const hasUnavailableClass =
				availabilityElement.classList.contains('stock') &&
				availabilityElement.classList.contains('unavailable');
			const hasAvailableClass =
				availabilityElement.classList.contains('stock') &&
				availabilityElement.classList.contains('available');

			if (hasUnavailableClass) {
				vendorData.onStock = false;
			} else if (hasAvailableClass) {
				vendorData.onStock = true;
			}
		}

		return vendorData;
	},
	'metalac.com': async function (document: Document) {
		const vendorData: VendorProduct = {
			c_bpartner_id: 1,
			name: 'metalac',
			price: null,
			barcode: [],
			brand: null,
			mpn: null,
			images: [],
			sku: null,
			vendorPriceEnd: null,
			onStock: null
		};
		const priceElement = document.querySelector<HTMLElement>('span.product-price');
		vendorData.price = priceElement ? parseFloat(priceElement.innerText.replace('.', '')) : null;

		const priceAvailability = document.querySelector('[data-max-qunatity]');
		const availabilityValue = priceAvailability?.getAttribute('data-max-qunatity');
		vendorData.onStock = availabilityValue !== '0' ? false : true;

		// Get the script element
		const h1Element = document.querySelector('h1.page-title');
		if (h1Element) {
			const productSKU = h1Element.getAttribute('id');
			const match = productSKU?.match(/fnc-product-name-(\d+)/);
			if (match) {
				// Extract the value
				vendorData.sku = match[1];
			}
		}

		// Get the meta element by its itemprop attribute
		const metaElement = document.querySelector('meta[itemprop="brand"]');
		if (metaElement) {
			// Access the content attribute of the meta element
			vendorData.brand = metaElement.getAttribute('content');
		}
		// Get all div elements with class "slick-zoom"
		const divElements = document.querySelectorAll('.slick-zoom');
		divElements.forEach(function (divElement) {
			// Access the src attribute of the div element
			const imageLink = divElement.getAttribute('src');
			if (imageLink) {
				// Add the image link to the array
				vendorData.images.push(imageLink);
			}
		});

		const inStockDiv = document.querySelector('div.in-stock');
		vendorData.onStock = inStockDiv ? true : false;

		// Get the div element by its class name
		//const divElement = document.querySelector<HTMLDivElement>('.special-offer');

		// Check if the div element exists
		/* if (divElement) {
			// Access the text content of the div
			const offerText = divElement.textContent || divElement.innerText;

			// Use regular expressions to find and extract the date
			const dateMatch = offerText.match(/(\d{2}.\d{2})/);

			// Check if a match was found
			if (dateMatch) {
				// Extract the date
				const extractedDate = dateMatch[1];
				const []=extractedDate.split()
				console.log('extractedDate', extractedDate);

				// Convert the extracted date to a JavaScript Date object
				vendorData.vendorPriceEnd = new Date(extractedDate.replace('.', '/'));
			}
		} */

		return vendorData;
	},
	'cenoteka.rs': async function (document: Document) {
		const vendorData: VendorProduct = {
			c_bpartner_id: 2,
			name: 'cenoteka',
			price: null,
			barcode: [],
			brand: null,
			mpn: null,
			images: [],
			sku: null,
			vendorPriceEnd: null,
			onStock: false
		};
		//let bestPrice: number | undefined = undefined;
		// Get the script element with id "__NEXT_DATA__"
		const scriptElement = document.getElementById('__NEXT_DATA__');
		// Extract the content of the script tag
		if (scriptElement?.textContent) {
			const {
				props: {
					pageProps: { variation }
				}
			} = JSON.parse(scriptElement.textContent);

			vendorData.sku = variation?.sku;
			vendorData.brand = variation?.brand?.name;
			vendorData.barcode = variation?.barcodes.map((barcode: { value: string }) => barcode.value);
			vendorData.images = [variation?.product_images[0]?.file?.product_large];

			const targetShops = ['Idea', 'Tempo', 'Roda', 'Maxi', 'Lidl'];

			const filteredPrices = variation?.prices.filter(
				(price: { shop: { name: string }; in_stock: boolean | null }) =>
					targetShops.includes(price.shop.name) && price.in_stock
			);
			//	console.log('filteredPrices', filteredPrices);

			const lowestPrice = Math.min(
				...filteredPrices.map((price: { current_price: number }) => price.current_price)
			);
			vendorData.price = lowestPrice;
			if (lowestPrice > 0) {
				vendorData.onStock = true;
			}
		} else {
			console.log('Script element with id "__NEXT_DATA__" not found.');
		}
		/* 		let vendorPrice = undefined;
		let mpn;
		let vendorPriceEnd; */
		//const priceDivs = document.querySelectorAll('.product_prices_offline_col__KZWlc > div');
		//	priceDivs?.forEach((div) => {
		//		const imgElement = div.querySelector('img');
		//		const sallerName = imgElement?.getAttribute('alt');
		//		let priceDiv = div.querySelector('.product_action_tooltip__4tt_0');
		//		if (!priceDiv) priceDiv = div.querySelector('.product_product_price__LLwr_');
		//		const sallerPrice = Number(priceDiv?.textContent?.replace('.', '').replace(',', '.'));
		//
		//		const sallers = ['Roda', 'Tempo', 'Idea', 'Lidl', 'Maxi'];
		//		if (sallerName && sallers.includes(sallerName)) {
		//			if (!bestPrice || sallerPrice < bestPrice) bestPrice = sallerPrice;
		//		}
		//	});
		//	if (bestPrice) return bestPrice;
		return vendorData;
	}
};

const getApiInfo: GetApiInfo = {
	'gigatron.rs': async function (url: string) {
		const vendorData: VendorProduct = {
			c_bpartner_id: 5,
			name: 'gigatron',
			price: null,
			barcode: [],
			brand: null,
			mpn: null,
			images: [],
			sku: null,
			vendorPriceEnd: null,
			onStock: null
		};
		const parts = url.split('-');
		const productId = parts[parts.length - 1];

		const myHeaders = new Headers();

		const requestOptions = {
			method: 'GET',
			headers: myHeaders
		};
		const response = await fetch(
			`https://api-v2.gigatron.rs/core/product/index/${productId}`,
			requestOptions
		);
		const { items } = await response.json();
		vendorData.price = parseFloat(items.price);
		vendorData.brand = items.brand.name;
		vendorData.barcode = [items.ean];
		vendorData.mpn = items.model;
		vendorData.sku = items.id;
		vendorData.images = items.images.map(
			(image: { sizes: { large: string } }) => image.sizes.large
		);

		const stickerEndDate = new Date(items.sticker_db.end);
		vendorData.vendorPriceEnd = stickerEndDate > new Date() ? stickerEndDate : null;
		vendorData.onStock = !items.out_of_stock;

		return vendorData;
	},
	'online.idea.rs': async function (url: string) {
		const vendorData: VendorProduct = {
			c_bpartner_id: 4,
			name: 'idea',
			price: null,
			barcode: [],
			brand: null,
			mpn: null,
			images: [],
			sku: null,
			onStock: null,
			vendorPriceEnd: null
		};
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
		console.log('data.price', data?.price);
		vendorData.barcode = data.barcodes;
		vendorData.onStock = data.active;
		vendorData.price = data.price.amount / 100;
		vendorData.brand = data.manufacturer;
		vendorData.images = ['https://online.idea.rs/' + data.images[0].image_l];
		vendorData.sku = data.id;
		vendorData.vendorPriceEnd = data.offer?.end_on ? new Date(data.offer.end_on) : null;

		return vendorData;
	},
	'maxi.rs': async function (url) {
		const vendorData: VendorProduct = {
			c_bpartner_id: 7,
			name: 'maxi',
			price: null,
			barcode: [],
			brand: null,
			mpn: null,
			images: [],
			sku: null,
			vendorPriceEnd: null,
			onStock: null
		};
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
		const {
			data: { productDetails }
		} = await response.json();

		if (productDetails.price.discountedPriceFormatted) {
			const rsdString = productDetails.price.discountedPriceFormatted;
			const numericValue = parseFloat(rsdString.replace(/[^0-9.]+/g, ''));

			vendorData.price = numericValue / 100;
		} else if (productDetails.price.unitPrice) {
			vendorData.price = productDetails.price.unitPrice;
		}

		vendorData.brand = productDetails.manufacturerName;
		vendorData.onStock = productDetails.stock.inStock;
		vendorData.images = productDetails.images.map(
			(item: { url: string }) => `https://static.maxi.rs${item.url}`
		);
		vendorData.sku = productDetails.code;
		if (typeof productDetails?.potentialPromotions?.[0]?.endDate === 'string') {
			// Split the string into date and time parts
			const [datePart, timePart] = productDetails.potentialPromotions[0].endDate.split(' ');
			// Split the date part into day, month, and year
			const [day, month, year] = datePart.split('/');
			// Split the time part into hours, minutes, and seconds
			const [hours, minutes, seconds] = timePart.split(':');
			// Create a new Date object using the parsed values
			vendorData.vendorPriceEnd = new Date(year, month - 1, day, hours, minutes, seconds);
		}
		console.log('vendorData', vendorData);
		return vendorData;
	}
};
