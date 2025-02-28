import { DateTime } from 'luxon';

type DateStyle = Intl.DateTimeFormatOptions['dateStyle'];
type TimeStyle = Intl.DateTimeFormatOptions['timeStyle'];
//type Style = Intl.NumberFormatOptions['style'];
//type Locales = Intl.LocalesArgument;

/**
 * Formatting options for the `formatNumber` function.
 */
interface NumberFormatOptions {
	style?: Intl.NumberFormatOptions['style'];
	currency?: string;
	fractionDigits?: number;
	locale?: Intl.LocalesArgument;
}
/**
 * Formats a number according to the provided options.
 * @param value - The number to be formatted.
 * @param options - The formatting options.
 * @returns The formatted number.
 */
export function formatNumber(
	value: number | null | undefined,
	options: NumberFormatOptions = {}
): string | null {
	if (value === null || value === undefined) return null;
	const { style = 'decimal', currency = 'RSD', fractionDigits = 2, locale = 'sr-Latn' } = options;

	const formatter = new Intl.NumberFormat(locale, {
		style,
		currency,
		minimumFractionDigits: fractionDigits,
		maximumFractionDigits: fractionDigits
	});

	return formatter.format(value);
}
//style: Style = 'currency',
//currency: string = 'RSD',
//minimumFractionDigits: number = 0

export function formatDateTime(
	value: string | null | undefined,
	locales = 'sr-Latn',
	dateStyle: DateStyle = 'medium',
	timeStyle: TimeStyle = 'medium'
) {
	if (value === undefined || value === null) {
		return;
	}
	const formatter = new Intl.DateTimeFormat(locales, { dateStyle, timeStyle });

	return formatter.format(new Date(value));
}

export function formatDate(date: string | null): string {
	return date ? DateTime.fromISO(date).setZone('Europe/Belgrade').toFormat('dd/MM/yyyy') : '';
}
