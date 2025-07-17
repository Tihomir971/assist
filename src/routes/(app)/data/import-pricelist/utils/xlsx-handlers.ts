import * as XLSX from 'xlsx';
import type { Product, Mapping } from '../types';
import { DateTime } from 'luxon';

interface RawExcelRow {
	[key: string]: string | number;
}

export function handleFileUpload(file: File | null): Promise<{
	sheetNames: string[];
	selectedSheet: string;
	excelData: Product[]; // This will remain empty from this function as per current logic
	headers: string[];
	rawData?: RawExcelRow[];
}> {
	return new Promise((resolve) => {
		if (file) {
			const reader = new FileReader();
			reader.onload = (e) => {
				const data = new Uint8Array(e.target?.result as ArrayBuffer);
				const workbook = XLSX.read(data, { type: 'array' });
				const sheetNames = workbook.SheetNames;
				const selectedSheet = sheetNames.length === 1 ? sheetNames[0] : '';
				const excelData: Product[] = [];
				const headers: string[] = [];

				if (selectedSheet) {
					const result = loadSheetData(workbook, selectedSheet);
					resolve({
						sheetNames,
						selectedSheet,
						excelData: result.excelData,
						headers: result.headers,
						rawData: result.rawData
					});
				} else {
					resolve({ sheetNames, selectedSheet, excelData, headers });
				}
			};
			reader.readAsArrayBuffer(file);
		} else {
			resolve({ sheetNames: [], selectedSheet: '', excelData: [], headers: [] });
		}
	});
}

export function loadSheetData(workbook: XLSX.WorkBook, sheetName: string) {
	const worksheet = workbook.Sheets[sheetName];
	const excelData: Product[] = [];
	const headers: string[] = [];

	if (!worksheet) return { headers, excelData, rawData: [] };

	const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');

	// Get headers
	for (let col = range.s.c; col <= range.e.c; col++) {
		const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
		const cell = worksheet[cellAddress];
		const header = cell ? cell.v.toString().trim() : `Unknown${col + 1}`;
		headers.push(header);
	}

	// Get raw data for debugging
	const rawData = XLSX.utils.sheet_to_json<RawExcelRow>(worksheet, {
		header: headers,
		raw: false,
		dateNF: 'mm/dd/yy'
	});

	return { headers, excelData, rawData };
}

function parseExcelDate(
	value: string | number | null | undefined,
	isEndDate: boolean = false
): string | null {
	if (!value) return null;

	let dt: DateTime | null = null;
	const zone = 'Europe/Belgrade';

	// If it's a number (Excel date), convert it using Excel's date system
	if (typeof value === 'number') {
		// Excel dates are days since 1900-01-01
		const days = value - 1; // Subtract 1 because Excel counts from 1/1/1900
		const milliseconds = days * 24 * 60 * 60 * 1000;
		const baseDate = new Date(Date.UTC(1900, 0, 1));
		const date = new Date(baseDate.getTime() + milliseconds);

		dt = DateTime.fromJSDate(date, { zone });
	}
	// If it's a string in M/D/YY or MM/DD/YY format
	else if (typeof value === 'string' && value.match(/^\d{1,2}\/\d{1,2}\/\d{2}$/)) {
		const [month, day, year] = value.split('/').map(Number);
		// Convert 2-digit year to 4-digit year (assuming 20xx for years 00-99)
		const fullYear = year + 2000;
		dt = DateTime.fromObject({ year: fullYear, month, day }, { zone });
	}
	// If it's a string in DD.MM.YYYY format (European format)
	else if (typeof value === 'string' && value.match(/^\d{1,2}\.\d{1,2}\.\d{4}$/)) {
		const [day, month, year] = value.split('.').map(Number);
		dt = DateTime.fromObject({ year, month, day }, { zone });
	}
	// If it's a string in DD/MM/YYYY format
	else if (typeof value === 'string' && value.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
		const [day, month, year] = value.split('/').map(Number);
		dt = DateTime.fromObject({ year, month, day }, { zone });
	}
	// Try parsing as a general date string
	else {
		const parsed = DateTime.fromSQL(String(value), { zone });
		if (parsed.isValid) {
			dt = parsed;
		} else {
			// Try parsing with Luxon's fromFormat for various common formats
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
		if (isEndDate) {
			// For end dates, set to end of day in Belgrade time, then convert to UTC
			dt = dt.endOf('day').toUTC();
		} else {
			// For start dates, set to start of day in Belgrade time, then convert to UTC
			dt = dt.startOf('day').toUTC();
		}
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
			// Handle comma-separated numbers
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
			const dateStr = parseExcelDate(value, false);
			return dateStr;
		}
		case 'valid_to': {
			const dateStr = parseExcelDate(value, true);
			return dateStr;
		}
		default:
			return String(value);
	}
}

export function processExcelData(
	file: File,
	selectedSheet: string,
	headers: string[],
	mappings: Mapping
): Promise<{
	totalRows: number;
	processedRows: number;
	excelData: Product[];
	rawData?: RawExcelRow[];
}> {
	return new Promise((resolve) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			const data = new Uint8Array(e.target?.result as ArrayBuffer);
			const workbook = XLSX.read(data, { type: 'array', cellDates: false, cellText: true });
			const worksheet = workbook.Sheets[selectedSheet];

			if (!worksheet) {
				resolve({ totalRows: 0, processedRows: 0, excelData: [], rawData: [] });
				return;
			}

			// Process data using raw strings
			const jsonData = XLSX.utils.sheet_to_json<RawExcelRow>(worksheet, {
				raw: false,
				dateNF: 'mm/dd/yy'
			});
			const totalRows = jsonData.length;
			let processedRows = 0;
			const excelData: Product[] = [];

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
					}
					// Always include the property even if empty to maintain structure
					else if (header) {
						(product[prop as keyof Product] as ProductValue) = '';
					}
				});

				excelData.push(product as Product);
				processedRows++;
			}

			resolve({ totalRows, processedRows, excelData, rawData: jsonData });
		};
		reader.readAsArrayBuffer(file);
	});
}
