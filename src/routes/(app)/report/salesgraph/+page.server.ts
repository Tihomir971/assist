import { connector } from '$lib/ky';
import type { PageServerLoad } from './$types';
import type { ChartData } from '../../catalog/products/[slug]/chart-types';

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
	const productIds = url.searchParams.get('skus')?.split(',') || [];

	if (productIds.length === 0) {
		return {
			chartData: {
				products: [],
				currentYear: new Date().getFullYear()
			}
		};
	}

	const { data } = await supabase.from('m_product').select('sku').in('id', productIds);

	try {
		const skus =
			data?.filter((item): item is { sku: string } => item.sku !== null).map((item) => item.sku) ||
			[];

		const chartData = (await connector
			.post('api/sales', {
				json: {
					productIds: skus,
					yearCount: 3
				}
			})
			.json<ChartData>()) || {
			products: [],
			currentYear: new Date().getFullYear()
		};

		return {
			chartData
		};
	} catch (error) {
		console.error('Error fetching sales data:', error);
		return {
			chartData: {
				products: [],
				currentYear: new Date().getFullYear()
			}
		};
	}
};
