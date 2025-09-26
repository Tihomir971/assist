import * as XLSX from 'xlsx';
import type { Mapping, Product } from '../types';
import { extractProductsFromSheet, loadSheetPreview } from './xlsx-shared';

// Typed helper to avoid eslint `any` while keeping compatibility with worker context
const postMessageFromWorker = (data: unknown) =>
	(self as unknown as { postMessage: (d: unknown) => void }).postMessage(data);

type PreviewReq = {
	type: 'preview';
	buffer: ArrayBuffer;
};

type SheetPreviewReq = {
	type: 'sheetPreview';
	buffer: ArrayBuffer;
	sheetName: string;
};

type ProcessReq = {
	type: 'process';
	buffer: ArrayBuffer;
	sheetName: string;
	mappings: Mapping;
	// Optional: when provided and > 0, only the first N rows will be sent back to the main thread
	sampleSize?: number;
};

type ProcessStreamReq = {
	type: 'processStream';
	buffer: ArrayBuffer;
	sheetName: string;
	mappings: Mapping;
	chunkSize?: number;
};

type RequestMessage = PreviewReq | SheetPreviewReq | ProcessReq | ProcessStreamReq;

type PreviewRes = {
	type: 'preview';
	sheetNames: string[];
	selectedSheet: string;
	headers: string[];
	rawData: Array<Record<string, string | number>>;
};

type SheetPreviewRes = {
	type: 'sheetPreview';
	headers: string[];
	rawData: Array<Record<string, string | number>>;
};

type ProcessRes = {
	type: 'process';
	totalRows: number;
	processedRows: number;
	excelData: Product[];
};

type ChunkRes = {
	type: 'chunk';
	rows: Product[];
	index: number;
};

type DoneRes = {
	type: 'done';
	totalRows: number;
	processedRows: number;
};

self.onmessage = (evt: MessageEvent<RequestMessage>) => {
	const data = evt.data;

	try {
		if (data.type === 'preview') {
			const workbook = XLSX.read(new Uint8Array(data.buffer), { type: 'array' });
			const sheetNames = workbook.SheetNames;
			let selectedSheet = '';
			let headers: string[] = [];
			let rawData: Array<Record<string, string | number>> = [];

			if (sheetNames.length === 1) {
				selectedSheet = sheetNames[0];
				const preview = loadSheetPreview(workbook, selectedSheet);
				headers = preview.headers;
				rawData = preview.rawData as Array<Record<string, string | number>>;
			}

			const res: PreviewRes = {
				type: 'preview',
				sheetNames,
				selectedSheet,
				headers,
				rawData
			};
			// Note: large buffers stay in worker; no need to transfer back
			postMessageFromWorker(res);
			return;
		}

		if (data.type === 'sheetPreview') {
			const workbook = XLSX.read(new Uint8Array(data.buffer), { type: 'array' });
			const { headers, rawData } = loadSheetPreview(workbook, data.sheetName);

			const res: SheetPreviewRes = {
				type: 'sheetPreview',
				headers,
				rawData: rawData as Array<Record<string, string | number>>
			};
			postMessageFromWorker(res);
			return;
		}

		if (data.type === 'processStream') {
			const workbook = XLSX.read(new Uint8Array(data.buffer), {
				type: 'array',
				cellDates: false,
				cellText: true
			});

			const result = extractProductsFromSheet(workbook, data.sheetName, data.mappings);

			const chunkSize =
				typeof data.chunkSize === 'number' && data.chunkSize > 0 ? data.chunkSize : 500;
			for (let i = 0, idx = 0; i < result.excelData.length; i += chunkSize, idx++) {
				const rows = result.excelData.slice(i, i + chunkSize);
				const chunk: ChunkRes = { type: 'chunk', rows, index: idx };
				postMessageFromWorker(chunk);
			}

			const done: DoneRes = {
				type: 'done',
				totalRows: result.totalRows,
				processedRows: result.processedRows
			};
			postMessageFromWorker(done);
			return;
		}

		if (data.type === 'process') {
			const workbook = XLSX.read(new Uint8Array(data.buffer), {
				type: 'array',
				cellDates: false,
				cellText: true
			});

			const result = extractProductsFromSheet(workbook, data.sheetName, data.mappings);

			// Limit rows transferred back to the main thread if sampleSize is set
			const sampleSize = typeof data.sampleSize === 'number' ? data.sampleSize : undefined;
			const excelDataSample =
				sampleSize && sampleSize > 0 && result.excelData.length > sampleSize
					? result.excelData.slice(0, sampleSize)
					: result.excelData;

			const res: ProcessRes = {
				type: 'process',
				totalRows: result.totalRows,
				processedRows: result.processedRows,
				excelData: excelDataSample
			};
			postMessageFromWorker(res);
			return;
		}
	} catch (err) {
		console.error('xlsx-worker error:', err);
		// Best-effort error reporting; the main thread should guard promises
		postMessageFromWorker({
			type: 'error',
			message: err instanceof Error ? err.message : String(err)
		});
	}
};
