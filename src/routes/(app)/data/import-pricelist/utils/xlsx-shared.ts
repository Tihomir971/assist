import * as XLSX from 'xlsx';
import type { Mapping, Product } from '../types';
import { DateTime } from 'luxon';

export interface RawExcelRow {
	[key: string]: string | number | null | undefined;
}

function parseExcelDate(
	value: string | number | null | undefined,
	isEndDate = false
): string | null {
	if (!value) return null;

	let dt: DateTime | null = null;
	const zone = 'Europe/Belgrade';

	if (typeof value === 'number') {
		const days = value - 1;
		const milliseconds = days * 24 * 60 * 60 * 1000;
		const baseDate = new Date(Date.UTC(1900, 0, 1));
		const date = new Date(baseDate.getTime() + milliseconds);
		dt = DateTime.fromJSDate(date, { zone });
	} else if (typeof value === 'string' && value.match(/^\d{1,2}\/\d{1,2}\/\d{2}$/)) {
		const [month, day, year] = value.split('/').map(Number);
		const fullYear = year + 2000;
		dt = DateTime.fromObject({ year: fullYear, month, day }, { zone });
	} else if (typeof value === 'string' && value.match(/^\d{1,2}\.\d{1,2}\.\d{4}$/)) {
		const [day, month, year] = value.split('.').map(Number);
		dt = DateTime.fromObject({ year, month, day }, { zone });
	} else if (typeof value === 'string' && value.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
		const [day, month, year] = value.split('/').map(Number);
		dt = DateTime.fromObject({ year, month, day }, { zone });
	} else {
		const parsed = DateTime.fromSQL(String(value), { zone });
		if (parsed.isValid) {
			dt = parsed;
		} else {
			const formats = [
				'd.M.yyyy',
				'dd.MM.yyyy',
				'd/M/yyyy',
				'dd/MM/yyyy',
				'yyyy-MM-dd',
				'dd-MM-yyyy'
			];
			for (const format of formats) {
				const formatted = DateTime.fromFormat(String(value), format, { zone });
				if (formatted.isValid) {
					dt = formatted;
					break;
				}
			}
		}
	}

	if (dt && dt.isValid) {
		dt = isEndDate ? dt.endOf('day').toUTC() : dt.startOf('day').toUTC();
		return dt.toISO();
	}

	return null;
}

type ProductValue = string | number | null;

function processValue(
	value: string | number | null | undefined,
	prop: keyof Product
): ProductValue {
	if (value === null || value === undefined) return null;

	switch (prop) {
		case 'pricelist': {
			const numStr = typeof value === 'string' ? value.replace(',', '.') : value;
			return typeof numStr === 'number' ? numStr : parseFloat(String(numStr));
		}
		case 'vendorproductno':
		case 'barcode':
		case 'name':
		case 'manufacturer':
		case 'vendorcategory':
			return String(value);
		case 'valid_from': {
			return parseExcelDate(value, false);
		}
		case 'valid_to': {
			return parseExcelDate(value, true);
		}
		default:
			return String(value);
	}
}

function getWorksheetHeaders(workbook: XLSX.WorkBook, sheetName: string): string[] {
	const worksheet = workbook.Sheets[sheetName];
	if (!worksheet) return [];

	const headers: string[] = [];
	const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');

	for (let col = range.s.c; col <= range.e.c; col++) {
		const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
		const cell = worksheet[cellAddress];
		const header = cell ? cell.v.toString().trim() : `Unknown${col + 1}`;
		headers.push(header);
	}

	return headers;
}

export function loadSheetPreview(
	workbook: XLSX.WorkBook,
	sheetName: string
): {
	headers: string[];
	rawData: RawExcelRow[];
} {
	const worksheet = workbook.Sheets[sheetName];
	if (!worksheet) return { headers: [], rawData: [] };

	const headers = getWorksheetHeaders(workbook, sheetName);
	const rawData = XLSX.utils.sheet_to_json<RawExcelRow>(worksheet, {
		header: headers,
		raw: false,
		dateNF: 'mm/dd/yy'
	});

	return { headers, rawData };
}

export function extractProductsFromSheet(
	workbook: XLSX.WorkBook,
	sheetName: string,
	mappings: Mapping
): {
	totalRows: number;
	processedRows: number;
	excelData: Product[];
	rawData: RawExcelRow[];
} {
	const worksheet = workbook.Sheets[sheetName];

	if (!worksheet) {
		return {
			totalRows: 0,
			processedRows: 0,
			excelData: [],
			rawData: []
		};
	}

	const jsonData = XLSX.utils.sheet_to_json<RawExcelRow>(worksheet, {
		raw: false,
		dateNF: 'mm/dd/yy'
	});

	const excelData: Product[] = [];
	let processedRows = 0;

	for (let i = 0; i < jsonData.length; i++) {
		const row = jsonData[i];

		const product: Partial<Product> = {};
		Object.entries(mappings).forEach(([prop, header]) => {
			if (header && row[header] !== undefined && row[header] !== null && row[header] !== '') {
				const originalValue = row[header];
				const value = processValue(originalValue, prop as keyof Product);
				if (value !== null) {
					(product[prop as keyof Product] as ProductValue) = value;
				}
			} else if (header) {
				(product[prop as keyof Product] as ProductValue) = '';
			}
		});

		excelData.push(product as Product);
		processedRows++;
	}

	return {
		totalRows: jsonData.length,
		processedRows,
		excelData,
		rawData: jsonData
	};
}
