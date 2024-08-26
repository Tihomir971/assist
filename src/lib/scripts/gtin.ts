export function isValidGTIN(barcode: string): boolean {
	// Remove any whitespace
	barcode = barcode.replace(/\s/g, '');

	// Check if the barcode consists only of digits
	if (!/^\d+$/.test(barcode)) {
		return false;
	}

	const length = barcode.length;

	// Check if the length is valid for GTIN
	if (![8, 12, 13, 14].includes(length)) {
		return false;
	}

	let sum = 0;
	let multiplier = 3;

	// Calculate the check digit
	for (let i = length - 2; i >= 0; i--) {
		const digit = parseInt(barcode[i], 10);
		sum += digit * multiplier;
		multiplier = 4 - multiplier; // This alternates between 3 and 1
	}

	const checkDigit = (10 - (sum % 10)) % 10;

	// Compare the calculated check digit with the last digit of the barcode
	return checkDigit === parseInt(barcode[length - 1], 10);
}
