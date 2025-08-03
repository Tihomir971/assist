import { connector } from '$lib/ky';
import type { PageServerLoad } from './$types';
import type { EChartsData } from '$lib/components/charts/chart-types';
import * as z from 'zod/v4';
import type { ApiResponseT } from '@tihomir971/assist-shared';

const searchParamsSchema = z.object({
	skus: z
		.string()
		.refine(
			(val) => val.split(',').every((id) => /^\d+$/.test(id)),
			'SKUs must be comma-separated numeric IDs'
		)
});

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
	const params = searchParamsSchema.safeParse(Object.fromEntries(url.searchParams));

	if (!params.success) {
		return {
			chartData: {
				series: [],
				xAxis: { data: [] }
			}
		};
	}

	const productIds = params.data.skus.split(',').map((id) => parseInt(id, 10));

	if (productIds.length === 0) {
		return {
			chartData: {
				series: [],
				xAxis: { data: [] }
			}
		};
	}

	const { data } = await supabase.from('m_product').select('sku').in('id', productIds);

	try {
		const skus =
			data?.filter((item): item is { sku: string } => item.sku !== null).map((item) => item.sku) ||
			[];

		const apiResponse = await connector
			.post('api/sales', {
				json: {
					productIds: skus,
					yearCount: 3
				}
			})
			.json<ApiResponseT<EChartsData>>();

		const chartData = apiResponse?.data ?? {
			series: [],
			xAxis: { data: [] }
		};
		return {
			chartData
		};
	} catch (error) {
		console.error('Error fetching sales data:', error);
		return {
			chartData: {
				series: [],
				xAxis: { data: [] }
			}
		};
	}
};
