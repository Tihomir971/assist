import type { Product, Mapping } from '../types';
import type { RawExcelRow } from './xlsx-shared';

// Worker loader (Vite/SvelteKit supports this pattern)
function createWorker(): Worker {
	return new Worker(new URL('./xlsx-worker.ts', import.meta.url), { type: 'module' });
}

async function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
	// Fast path available in modern browsers
	if (file.arrayBuffer) return file.arrayBuffer();
	// Fallback
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as ArrayBuffer);
		reader.onerror = reject;
		reader.readAsArrayBuffer(file);
	});
}

// Generic one-shot worker call to avoid concurrent message routing complexities.
// Spawns a worker per request and terminates it after the first response.
function callWorker<TReq extends Record<string, unknown>, TRes = unknown>(
	req: TReq
): Promise<TRes> {
	return new Promise((resolve, reject) => {
		const worker = createWorker();
		const cleanup = () => worker.terminate();

		worker.onmessage = (evt: MessageEvent) => {
			const data = evt.data as { type?: string; message?: string };
			// Basic error channel from worker
			if (data && data.type === 'error') {
				cleanup();
				reject(new Error(data.message || 'Worker error'));
				return;
			}
			cleanup();
			resolve(evt.data as TRes);
		};
		worker.onerror = (e) => {
			console.error('xlsx-worker onerror:', e);
			cleanup();
			reject(e);
		};

		// Prefer transferring the ArrayBuffer to avoid cloning errors and improve performance
		try {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const maybeBuffer = (req as any)?.buffer;
			if (maybeBuffer instanceof ArrayBuffer) {
				worker.postMessage(req, [maybeBuffer]);
			} else {
				worker.postMessage(req);
			}
		} catch (err) {
			cleanup();
			reject(err);
		}
	});
}

/**
 * Read a file and return workbook preview without parsing on the main thread.
 * - sheetNames: all sheet names
 * - selectedSheet: if there is a single sheet, it will be selected; otherwise ''
 * - headers/rawData: only filled when selectedSheet is determined by the worker (single-sheet case)
 */
export async function handleFileUpload(file: File | null): Promise<{
	sheetNames: string[];
	selectedSheet: string;
	excelData: Product[]; // kept for compatibility (remains empty at this stage)
	headers: string[];
	rawData?: RawExcelRow[];
}> {
	if (!file) {
		return { sheetNames: [], selectedSheet: '', excelData: [], headers: [] };
	}
	const buffer = await fileToArrayBuffer(file);

	const res = await callWorker<
		{ type: 'preview'; buffer: ArrayBuffer },
		{
			type: 'preview';
			sheetNames: string[];
			selectedSheet: string;
			headers: string[];
			rawData: RawExcelRow[];
		}
	>({
		type: 'preview',
		buffer
	});

	// Keep excelData empty here by design
	return {
		sheetNames: res.sheetNames,
		selectedSheet: res.selectedSheet,
		excelData: [],
		headers: res.headers,
		rawData: res.rawData
	};
}

/**
 * Load headers and rawData for a specific sheet using the worker.
 * Used after the user selects a sheet in the UI.
 */
export async function loadSheetDataFromFile(
	file: File,
	sheetName: string
): Promise<{ headers: string[]; rawData: RawExcelRow[] }> {
	const buffer = await fileToArrayBuffer(file);

	const res = await callWorker<
		{ type: 'sheetPreview'; buffer: ArrayBuffer; sheetName: string },
		{ type: 'sheetPreview'; headers: string[]; rawData: RawExcelRow[] }
	>({
		type: 'sheetPreview',
		buffer,
		sheetName
	});

	return { headers: res.headers, rawData: res.rawData };
}

/**
 * Process the selected sheet into typed Product[] using the worker.
 * Signature matches previous version to keep callers unchanged.
 * The 'headers' parameter is kept for compatibility and is not required by the worker.
 */
export async function processExcelData(
	file: File,
	selectedSheet: string,
	_headers: string[], // unused in worker-based processing, retained for compatibility
	mappings: Mapping,
	options?: { sampleSize?: number }
): Promise<{
	totalRows: number;
	processedRows: number;
	excelData: Product[];
}> {
	const buffer = await fileToArrayBuffer(file);

	// Ensure mappings is a plain JSON object (avoid Svelte proxy objects breaking structured clone)
	const plainMappings: Mapping = JSON.parse(JSON.stringify(mappings));

	const res = await callWorker<
		{
			type: 'process';
			buffer: ArrayBuffer;
			sheetName: string;
			mappings: Mapping;
			sampleSize?: number;
		},
		{
			type: 'process';
			totalRows: number;
			processedRows: number;
			excelData: Product[];
		}
	>({
		type: 'process',
		buffer,
		sheetName: selectedSheet,
		mappings: plainMappings,
		sampleSize: options?.sampleSize
	});

	return {
		totalRows: res.totalRows,
		processedRows: res.processedRows,
		excelData: res.excelData
	};
}

// Deprecated: The old main-thread helpers have been removed to prevent long tasks.
// If you still need direct workbook parsing, use the worker-based functions above instead.
