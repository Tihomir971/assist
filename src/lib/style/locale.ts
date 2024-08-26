type DateStyle = Intl.DateTimeFormatOptions['dateStyle'];
type TimeStyle = Intl.DateTimeFormatOptions['timeStyle'];
type Style = Intl.NumberFormatOptions['style'];
type Locales = Intl.LocalesArgument;

export function formatNumber(
	value: number | undefined,
	locales: Locales = 'sr-Latn',
	style: Style = 'currency',
	currency: string = 'RSD',
	minimumFractionDigits: number = 0
) {
	if (value === undefined) {
		return;
	}
	return new Intl.NumberFormat(locales, {
		style,
		currency,
		minimumFractionDigits
	}).format(value);
}

export function formatDateTime(
	value: string | undefined,
	locales = 'sr-Latn',
	dateStyle: DateStyle = 'medium',
	timeStyle: TimeStyle = 'medium'
) {
	if (value === undefined) {
		return;
	}
	const formatter = new Intl.DateTimeFormat(locales, { dateStyle, timeStyle });

	return formatter.format(new Date(value));
}
