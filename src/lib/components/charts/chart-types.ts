import * as z from 'zod/v4';

export const SalesDataRequestSchema = z.object({
	productIds: z.array(z.string()).min(1, 'At least one product ID is required'),
	yearCount: z.number().min(1).max(3).optional().default(1)
});

interface MonthData {
	month: number;
	value: number;
}

export interface YearData {
	year: number;
	months: MonthData[];
}

interface ProductChartData {
	productId: string;
	years: YearData[];
}

export interface ChartData {
	products: ProductChartData[];
	currentYear: number;
}

export interface EChartsSeries {
	name: string;
	data: number[];
}

export interface EChartsData {
	xAxis: {
		data: string[];
	};
	series: EChartsSeries[];
}
