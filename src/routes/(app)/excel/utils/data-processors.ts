export { processExcelData } from './xlsx-handlers';

export function normalizeVendorProductNo(
	vendorproductno: string,
	supplierId?: number | undefined
): string {
	// Remove any non-digit characters
	let normalized = vendorproductno.replace(/\D/g, '');

	if (supplierId === 4) {
		// For supplier 4, ensure the vendorproductno is 9 digits long
		normalized = normalized.padStart(9, '0');
		// If it's longer than 9 digits, take the last 9
		normalized = normalized.slice(-9);
	} else {
		// For other suppliers, just remove leading zeros
		normalized = normalized.replace(/^0+/, '');
	}

	return normalized;
}

export function modifyPrice(price: number, percentage: number): number {
	return price * (1 + percentage / 100);
}
