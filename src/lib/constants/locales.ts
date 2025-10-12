// ============================================
// LOCALE CONFIGURATION TABLES - BALKAN FOCUS
// ============================================

// 1. LOCALES - Balkan countries with script variants + major languages
export const LOCALES = [
	{ code: 'sr-Cyrl-RS', name: 'Serbian Cyrillic (Serbia)', nativeName: 'Српски (Србија)' },
	{ code: 'sr-Latn-RS', name: 'Serbian Latin (Serbia)', nativeName: 'Srpski (Srbija)' },
	{ code: 'hr-HR', name: 'Croatian (Croatia)', nativeName: 'Hrvatski (Hrvatska)' },
	{
		code: 'bs-Latn-BA',
		name: 'Bosnian Latin (Bosnia)',
		nativeName: 'Bosanski (Bosna i Hercegovina)'
	},
	{
		code: 'bs-Cyrl-BA',
		name: 'Bosnian Cyrillic (Bosnia)',
		nativeName: 'Босански (Босна и Херцеговина)'
	},
	{
		code: 'sr-Latn-ME',
		name: 'Montenegrin Latin (Montenegro)',
		nativeName: 'Crnogorski (Crna Gora)'
	},
	{
		code: 'sr-Cyrl-ME',
		name: 'Montenegrin Cyrillic (Montenegro)',
		nativeName: 'Црногорски (Црна Гора)'
	},
	{
		code: 'mk-MK',
		name: 'Macedonian (North Macedonia)',
		nativeName: 'Македонски (Северна Македонија)'
	},
	{ code: 'sl-SI', name: 'Slovenian (Slovenia)', nativeName: 'Slovenščina (Slovenija)' },
	{ code: 'bg-BG', name: 'Bulgarian (Bulgaria)', nativeName: 'Български (България)' },
	{ code: 'ro-RO', name: 'Romanian (Romania)', nativeName: 'Română (România)' },
	{ code: 'el-GR', name: 'Greek (Greece)', nativeName: 'Ελληνικά (Ελλάδα)' },
	{ code: 'sq-AL', name: 'Albanian (Albania)', nativeName: 'Shqip (Shqipëri)' },
	{ code: 'sq-XK', name: 'Albanian (Kosovo)', nativeName: 'Shqip (Kosovë)' },
	{ code: 'tr-TR', name: 'Turkish (Turkey)', nativeName: 'Türkçe (Türkiye)' },
	{ code: 'en-US', name: 'English (United States)', nativeName: 'English (United States)' },
	{ code: 'en-GB', name: 'English (United Kingdom)', nativeName: 'English (United Kingdom)' },
	{ code: 'de-DE', name: 'German (Germany)', nativeName: 'Deutsch (Deutschland)' },
	{ code: 'de-AT', name: 'German (Austria)', nativeName: 'Deutsch (Österreich)' },
	{ code: 'it-IT', name: 'Italian (Italy)', nativeName: 'Italiano (Italia)' },
	{ code: 'fr-FR', name: 'French (France)', nativeName: 'Français (France)' },
	{ code: 'ru-RU', name: 'Russian (Russia)', nativeName: 'Русский (Россия)' }
];

// 2. CURRENCIES - Balkan + major currencies
export const CURRENCIES = [
	{ code: 'RSD', symbol: 'дин', name: 'Serbian Dinar', countries: ['RS'] },
	{
		code: 'EUR',
		symbol: '€',
		name: 'Euro',
		countries: ['SI', 'ME', 'XK', 'GR', 'DE', 'AT', 'IT', 'FR']
	},
	{ code: 'BAM', symbol: 'КМ', name: 'Bosnia-Herzegovina Mark', countries: ['BA'] },
	{ code: 'HRK', symbol: 'kn', name: 'Croatian Kuna', countries: ['HR'] },
	{ code: 'MKD', symbol: 'ден', name: 'Macedonian Denar', countries: ['MK'] },
	{ code: 'ALL', symbol: 'L', name: 'Albanian Lek', countries: ['AL'] },
	{ code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev', countries: ['BG'] },
	{ code: 'RON', symbol: 'lei', name: 'Romanian Leu', countries: ['RO'] },
	{ code: 'TRY', symbol: '₺', name: 'Turkish Lira', countries: ['TR'] },
	{ code: 'USD', symbol: '$', name: 'US Dollar', countries: ['US'] },
	{ code: 'GBP', symbol: '£', name: 'British Pound', countries: ['GB'] },
	{ code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', countries: ['CH'] },
	{ code: 'RUB', symbol: '₽', name: 'Russian Ruble', countries: ['RU'] }
];

// 3. TIMEZONES - Balkan + major zones
export const TIMEZONES = [
	{
		code: 'Europe/Belgrade',
		name: 'Belgrade',
		offset: 'UTC+1/+2',
		countries: ['RS', 'ME', 'BA', 'HR', 'MK', 'SI']
	},
	{ code: 'Europe/Sofia', name: 'Sofia', offset: 'UTC+2/+3', countries: ['BG'] },
	{ code: 'Europe/Bucharest', name: 'Bucharest', offset: 'UTC+2/+3', countries: ['RO'] },
	{ code: 'Europe/Athens', name: 'Athens', offset: 'UTC+2/+3', countries: ['GR'] },
	{ code: 'Europe/Istanbul', name: 'Istanbul', offset: 'UTC+3', countries: ['TR'] },
	{ code: 'Europe/Tirane', name: 'Tirana', offset: 'UTC+1/+2', countries: ['AL', 'XK'] },
	{ code: 'Europe/London', name: 'London', offset: 'UTC+0/+1', countries: ['GB'] },
	{ code: 'Europe/Paris', name: 'Paris', offset: 'UTC+1/+2', countries: ['FR'] },
	{ code: 'Europe/Berlin', name: 'Berlin', offset: 'UTC+1/+2', countries: ['DE'] },
	{ code: 'Europe/Vienna', name: 'Vienna', offset: 'UTC+1/+2', countries: ['AT'] },
	{ code: 'Europe/Rome', name: 'Rome', offset: 'UTC+1/+2', countries: ['IT'] },
	{ code: 'Europe/Zurich', name: 'Zurich', offset: 'UTC+1/+2', countries: ['CH'] },
	{ code: 'Europe/Moscow', name: 'Moscow', offset: 'UTC+3', countries: ['RU'] },
	{ code: 'America/New_York', name: 'New York', offset: 'UTC-5/-4', countries: ['US'] },
	{ code: 'America/Los_Angeles', name: 'Los Angeles', offset: 'UTC-8/-7', countries: ['US'] },
	{ code: 'Asia/Dubai', name: 'Dubai', offset: 'UTC+4', countries: ['AE'] },
	{ code: 'Asia/Tokyo', name: 'Tokyo', offset: 'UTC+9', countries: ['JP'] }
];

// 4. DATE FORMATS - Common formats in Balkans
export const DATE_FORMATS = [
	{
		code: 'DD.MM.YYYY',
		name: 'DD.MM.YYYY',
		example: '10.10.2025',
		regions: ['RS', 'ME', 'BA', 'HR', 'SI', 'DE', 'AT']
	},
	{
		code: 'DD/MM/YYYY',
		name: 'DD/MM/YYYY',
		example: '10/10/2025',
		regions: ['MK', 'BG', 'RO', 'GR', 'AL', 'TR', 'GB']
	},
	{ code: 'MM/DD/YYYY', name: 'MM/DD/YYYY', example: '10/10/2025', regions: ['US'] },
	{ code: 'YYYY-MM-DD', name: 'YYYY-MM-DD', example: '2025-10-10', regions: ['ISO'] },
	{ code: 'DD-MM-YYYY', name: 'DD-MM-YYYY', example: '10-10-2025', regions: ['IT', 'FR'] }
];

// 5. TIME FORMATS
export const TIME_FORMATS = [
	{ code: '24h', name: '24-hour (23:59)', example: '14:30' },
	{ code: '12h', name: '12-hour (11:59 PM)', example: '2:30 PM' }
];

// 6. FIRST DAY OF WEEK
export const FIRST_DAY_OF_WEEK = [
	{ code: 0, name: 'Sunday' },
	{ code: 1, name: 'Monday' }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

// Get default currency for a locale
export function getDefaultCurrency(locale: string) {
	const region = locale.split('-').pop(); // Get last part (RS, BA, HR, etc.)
	if (!region) return 'EUR'; // Return default if no region found
	const currency = CURRENCIES.find((c) => c.countries.includes(region));
	return currency ? currency.code : 'EUR';
}

// Get locale's default timezone
export function getDefaultTimezone(locale: string) {
	const region = locale.split('-').pop();
	if (!region) return 'Europe/Belgrade'; // Return default if no region found
	const timezone = TIMEZONES.find((tz) => tz.countries?.includes(region));
	return timezone ? timezone.code : 'Europe/Belgrade';
}

// Get locale's typical date format
export function getDefaultDateFormat(locale: string) {
	const region = locale.split('-').pop();
	if (!region) return 'DD.MM.YYYY'; // Return default if no region found
	const format = DATE_FORMATS.find((f) => f.regions.includes(region));
	return format ? format.code : 'DD.MM.YYYY';
}

// Get locale's typical time format (Balkans prefer 24h)
export function getDefaultTimeFormat(locale: string) {
	const region = locale.split('-').pop();
	return region === 'US' ? '12h' : '24h';
}

// Get locale's typical first day of week (Balkans prefer Monday)
export function getDefaultFirstDayOfWeek(locale: string) {
	const region = locale.split('-').pop();
	return region === 'US' ? 0 : 1;
}

// ============================================
// CREATE USER PREFERENCES WITH SMART DEFAULTS
// ============================================

export function createUserPreferences(locale = 'sr-Latn-RS') {
	return {
		locale,
		timezone: getDefaultTimezone(locale),
		currency: getDefaultCurrency(locale),
		dateFormat: getDefaultDateFormat(locale),
		timeFormat: getDefaultTimeFormat(locale),
		firstDayOfWeek: getDefaultFirstDayOfWeek(locale)
	};
}

// ============================================
// EXAMPLES
// ============================================

// Serbian user (Latin script)
// const prefs1 = createUserPreferences('sr-Latn-RS');
// Result: { locale: 'sr-Latn-RS', timezone: 'Europe/Belgrade', currency: 'RSD', dateFormat: 'DD.MM.YYYY', timeFormat: '24h', firstDayOfWeek: 1 }

// Croatian user
// const prefs2 = createUserPreferences('hr-HR');
// Result: { locale: 'hr-HR', timezone: 'Europe/Belgrade', currency: 'HRK', dateFormat: 'DD.MM.YYYY', timeFormat: '24h', firstDayOfWeek: 1 }

// Greek user
// const prefs3 = createUserPreferences('el-GR');
// Result: { locale: 'el-GR', timezone: 'Europe/Athens', currency: 'EUR', dateFormat: 'DD/MM/YYYY', timeFormat: '24h', firstDayOfWeek: 1 }
