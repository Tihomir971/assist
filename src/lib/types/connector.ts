export interface MonthData {
	month: number;
	value: number;
}

export interface YearData {
	year: number;
	months: MonthData[];
}

export type ChartData = {
	years: YearData[];
	currentYear: number;
};

export interface ProcessedYearValue {
	year: number;
	value: number;
	isCurrentYear: boolean;
}

export interface ProcessedMonthData {
	month: number;
	yearValues: ProcessedYearValue[];
}
