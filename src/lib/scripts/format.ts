type DateStyle = Intl.DateTimeFormatOptions['dateStyle'];
type TimeStyle = Intl.DateTimeFormatOptions['timeStyle'];

export function DateTimeFormat(
	date: string,
	dateStyle: DateStyle = 'medium',
	timeStyle: TimeStyle = 'medium',
	locales = 'sr-Latn'
) {
	const formatter = new Intl.DateTimeFormat(locales, { dateStyle, timeStyle });

	return formatter.format(new Date(date));
}

export function numberFormat(
	value: number,
	locales: string = 'default',
	/* locales: string = 'sr-Latn', */
	style: 'decimal' | 'currency' | 'percent' = 'decimal',
	fractionDigits: number = 2
): string {
	const formatter = new Intl.NumberFormat(locales, {
		style: style,
		minimumFractionDigits: fractionDigits,
		maximumFractionDigits: fractionDigits
	});

	return formatter.format(value);
}
