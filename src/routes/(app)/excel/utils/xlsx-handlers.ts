import * as XLSX from 'xlsx';
import type { Product, Mapping } from '../types';

export function handleFileUpload(event: Event): Promise<{
	sheetNames: string[];
	selectedSheet: string;
	excelData: Product[];
	headers: string[];
}> {
	return new Promise((resolve) => {
		const file = (event.target as HTMLInputElement).files?.[0];
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
						headers: result.headers
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

	if (!worksheet) return { headers, excelData };

	const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');

	for (let col = range.s.c; col <= range.e.c; col++) {
		const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
		const cell = worksheet[cellAddress];
		const header = cell ? cell.v.toString().trim() : `Unknown${col + 1}`;
		headers.push(header);
	}

	return { headers, excelData };
}

export function processExcelData(
	file: File,
	selectedSheet: string,
	headers: string[],
	mappings: Mapping
): Promise<{ totalRows: number; processedRows: number; excelData: Product[] }> {
	return new Promise((resolve) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			const data = new Uint8Array(e.target?.result as ArrayBuffer);
			const workbook = XLSX.read(data, { type: 'array' });
			const worksheet = workbook.Sheets[selectedSheet];

			if (!worksheet) {
				resolve({ totalRows: 0, processedRows: 0, excelData: [] });
				return;
			}

			const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
			const totalRows = jsonData.length - 1; // Exclude header row
			let processedRows = 0;
			const excelData: Product[] = [];

			for (let i = 1; i < jsonData.length; i++) {
				const row = jsonData[i] as any[];
				const product: Partial<Product> = {};
				Object.entries(mappings).forEach(([prop, header]) => {
					const colNumber = headers.indexOf(header);
					if (colNumber > -1) {
						let value = row[colNumber];
						if (prop === 'pricelist') {
							value = typeof value === 'number' ? value : parseFloat(value);
						}
						if (prop === 'vendorproductno' || prop === 'barcode') {
							value = typeof value === 'string' ? value : value?.toString();
						}
						product[prop as keyof Product] = value as any;
					}
				});
				excelData.push(product as Product);
				processedRows++;
			}

			resolve({ totalRows, processedRows, excelData });
		};
		reader.readAsArrayBuffer(file);
	});
}
