import { BIZNISOFT_BEARER_TOKEN } from '$env/static/private';
import { json, redirect, type RequestHandler } from '@sveltejs/kit';

const myHeaders = new Headers({ Authorization: 'Bearer ' + BIZNISOFT_BEARER_TOKEN });

export const GET: RequestHandler = async ({ params, locals: { supabase, getSession } }) => {
	const session = await getSession();
	if (!session) {
		redirect(303, '/auth');
	}

	if (params.slug === undefined) return new Response('slug is undefined');
	const m_product_id = Number(params.slug);
	const { data: product } = await supabase
		.from('m_product')
		.select('sku')
		.eq('id', m_product_id)
		.maybeSingle();
	if (!product) {
		return json({ code: 'warning', message: 'Product not found' });
	}
	const apiUrl = `https://biznisoft-api.kalisi.rs/api/catalog/getProduct?id=${product.sku}`;
	console.log('apiUrl', apiUrl);

	const response = await fetch(apiUrl, {
		method: 'GET',
		headers: myHeaders
	});

	if (!response.ok) {
		throw new Error('Network response was not ok');
	}

	const productErp = await response.json();
	/* 	const { error: errorProduct } = await supabase
		.from('m_product')
		.update({
			name: productErp.naziv,
			mpn: productErp.katbr,
			barcode: productErp.barkod,
			unitsperpack: productErp.kpkolicina
		})
		.eq('id', m_product_id)
		.maybeSingle();
	if (errorProduct) {
		return json({ code: 'error', message: ` for vendors`, productErp });
	} */
	console.log('response', productErp[0]);

	return json({ code: 'success', message: ` for vendors`, productErp });
};
