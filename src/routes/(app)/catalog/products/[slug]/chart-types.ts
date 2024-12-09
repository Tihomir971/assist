import { z } from 'zod';

export const SalesDataRequestSchema = z.object({
	productIds: z.array(z.string()).min(1, 'At least one product ID is required'),
	yearCount: z.number().min(1).max(3).optional().default(1)
});

export type SalesDataRequest = z.infer<typeof SalesDataRequestSchema>;

export interface MonthData {
	month: number;
	value: number;
}

export interface YearData {
	year: number;
	months: MonthData[];
}

export interface ProductChartData {
	productId: string;
	years: YearData[];
}

export interface ChartData {
	products: ProductChartData[];
	currentYear: number;
}

export interface SalesQueryResult {
	month: number;
	total_izlaz: number;
}
