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
	} else if (supplierId === 347) {
		// For Spektar (ID 347), we must preserve the original code,
		// as it can contain leading zeros that are significant.
		// We just return the original value after removing non-digit characters.
		return normalized;
	} else {
		// For all other suppliers, continue to remove leading zeros.
		normalized = normalized.replace(/^0+/, '');
	}

	return normalized;
}

export function modifyPrice(price: number, percentage: number): number {
	return price * (1 + percentage / 100);
}
