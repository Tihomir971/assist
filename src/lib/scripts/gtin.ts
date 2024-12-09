export function isValidGTIN(barcode: string): boolean {
	// Remove whitespace and check for digits
	barcode = barcode.replace(/\s/g, '');
	if (!/^\d+$/.test(barcode)) {
		return false;
	}

	const length = barcode.length;
	if (![8, 12, 13, 14].includes(length)) {
		return false;
	}

	let sum = 0;
	let multiplier = 3;
	for (let i = length - 2; i >= 0; i--) {
		sum += parseInt(barcode[i], 10) * multiplier;
		multiplier = 4 - multiplier;
	}

	const checkDigit = (10 - (sum % 10)) % 10;
	return checkDigit === parseInt(barcode[length - 1], 10);
}
