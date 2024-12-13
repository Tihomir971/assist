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

type DateFormat = 'date' | 'dateTime' | 'time';

interface DateFormatOptions {
	date: Intl.DateTimeFormatOptions;
	dateTime: Intl.DateTimeFormatOptions;
	time: Intl.DateTimeFormatOptions;
}

const formatOptions: DateFormatOptions = {
	date: { year: 'numeric', month: 'long', day: 'numeric' },
	dateTime: { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' },
	time: { hour: 'numeric', minute: 'numeric' }
};

export function formatDate(
	date: Date | string | number | null | undefined,
	format: DateFormat = 'date'
): string {
	if (!date) {
		return '';
	}
	const dateObject = date instanceof Date ? date : new Date(date);

	if (isNaN(dateObject.getTime())) {
		throw new Error('Invalid date provided');
	}

	return new Intl.DateTimeFormat('sr-Latn', formatOptions[format]).format(dateObject);
}
