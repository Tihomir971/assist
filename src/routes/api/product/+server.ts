import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { SupabaseClient } from '@supabase/supabase-js';

type ProductGTIN = {
	gtin: string;
	m_product: {
		name: string;
		description: string;
	};
};

async function findProductByGTIN(gtin: string, supabase: SupabaseClient) {
	const { data, error } = await supabase
		.from('m_product_gtin')
		.select(
			`
            gtin,
            m_product(name,description)
        `
		)
		.eq('gtin', '8600462040815')
		/* .eq('gtin', gtin) */
		.single();

	if (error) {
		console.error('Error querying Supabase:', error);
		throw new Error('Database query failed');
	}

	if (data) {
		return data;
	}

	return null;
}

export const GET: RequestHandler = async ({ url, locals }) => {
	const gtin = url.searchParams.get('gtin');
	if (!gtin) {
		return json({ error: 'GTIN parameter is required' }, { status: 400 });
	}

	try {
		const product = await findProductByGTIN(gtin, locals.supabase);
		console.log('product', product);
		if (product) {
			return json(product);
		} else {
			return json({ error: 'Product not found' }, { status: 404 });
		}
	} catch (error) {
		console.error('Error in GET handler:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
