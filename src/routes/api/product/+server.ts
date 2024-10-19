import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { SupabaseClient, PostgrestError } from '@supabase/supabase-js';

type ProductGTIN = {
	gtins: string[];
	m_product: {
		name: string;
		description: string | null;
		sku: string;
	};
	storage_info: {
		qtyonhand: number;
		m_warehouse: {
			name: string;
		};
	}[];
};

type SupabaseResponse = {
	name: string;
	description: string | null;
	sku: string;
	m_product_gtin: { gtin: string }[];
	m_storageonhand: {
		qtyonhand: number;
		m_warehouse: {
			name: string;
		};
	}[];
};

async function findProductByGTIN(
	gtin: string,
	supabase: SupabaseClient
): Promise<ProductGTIN | null> {
	const result = (await supabase
		.from('m_product_gtin')
		.select(
			`
            m_product!inner (
                name,
                description,
                sku,
                m_product_gtin (
                    gtin
                ),
                m_storageonhand (
                    qtyonhand,
                    m_warehouse (
                        name
                    )
                )
            )
        `
		)
		.eq('gtin', gtin)
		.single()) as { data: { m_product: SupabaseResponse } | null; error: PostgrestError | null };

	console.log('Raw data from findProductByGTIN:', JSON.stringify(result.data, null, 2));

	if (result.error) {
		console.error('Error querying Supabase:', result.error);
		throw new Error(`Database query failed: ${result.error.message}`);
	}

	if (!result.data || !result.data.m_product) {
		return null;
	}

	return formatSupabaseResponse(result.data.m_product);
}

async function findProductBySKU(
	sku: string,
	supabase: SupabaseClient
): Promise<ProductGTIN | null> {
	const result = (await supabase
		.from('m_product')
		.select(
			`
            name,
            description,
            sku,
            m_product_gtin (
                gtin
            ),
            m_storageonhand (
                qtyonhand,
                m_warehouse (
                    name
                )
            )
        `
		)
		.eq('sku', sku)
		.single()) as { data: SupabaseResponse | null; error: PostgrestError | null };

	if (result.error) {
		console.error('Error querying Supabase:', result.error);
		throw new Error(`Database query failed: ${result.error.message}`);
	}

	if (!result.data) {
		return null;
	}

	return formatSupabaseResponse(result.data);
}

function formatSupabaseResponse(supabaseData: SupabaseResponse): ProductGTIN {
	return {
		gtins: supabaseData.m_product_gtin.map((g) => g.gtin).filter(Boolean),
		m_product: {
			name: supabaseData.name,
			description: supabaseData.description,
			sku: supabaseData.sku
		},
		storage_info: supabaseData.m_storageonhand.map((storage) => ({
			qtyonhand: storage.qtyonhand,
			m_warehouse: {
				name: storage.m_warehouse.name
			}
		}))
	};
}

export const GET: RequestHandler = async ({ url, locals }): Promise<Response> => {
	const gtin = url.searchParams.get('gtin');
	const sku = url.searchParams.get('sku');

	if (!gtin && !sku) {
		return json({ error: 'Either GTIN or SKU parameter is required' }, { status: 400 });
	}

	try {
		let product: ProductGTIN | null = null;

		if (gtin) {
			product = await findProductByGTIN(gtin, locals.supabase);
		} else if (sku) {
			product = await findProductBySKU(sku, locals.supabase);
		}

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
