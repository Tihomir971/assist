/**
 * Configuration options for the NumberFormatter constructor.
 */
export interface NumberFormatterConfig {
	/** A BCP 47 language tag. Defaults to 'sr-Latn-RS'. */
	locale?: string;
	/** Default formatting options to apply to all method calls. */
	defaultOptions?: Intl.NumberFormatOptions;
	/** The string to return when the input value is null or undefined. Defaults to an empty string ''. */
	nullishFallback?: string;
}

/**
 * Extends the standard Intl.NumberFormatOptions with a custom convenience property.
 */
interface CustomDecimalOptions extends Intl.NumberFormatOptions {
	/**
	 * A convenience property to set both `minimumFractionDigits` and
	 * `maximumFractionDigits` to the same value.
	 * If provided, it forces a fixed number of decimal places.
	 * - `fractionDigits: 0` formats as an integer.
	 * - `fractionDigits: 2` formats with exactly two decimal places.
	 * If omitted, the default decimal formatting for the locale is used.
	 */
	fractionDigits?: number;
}
/**
 * A versatile helper class for formatting numbers using the Intl.NumberFormat API.
 * It gracefully handles null and undefined values by returning a configurable fallback string.
 *
 * @example
 * // Create an instance with default settings (locale: 'sr-Latn-RS', fallback: '')
 * const formatter = new NumberFormatter();
 * formatter.formatCurrency(null, 'RSD'); // Returns ""
 *
 * // Create an instance with a custom fallback for missing values
 * const customFormatter = new NumberFormatter({ nullishFallback: 'N/A' });
 * customFormatter.formatDecimal(undefined); // Returns "N/A"
 */
export class NumberFormatter {
	private readonly locale: string;
	private readonly defaultOptions: Intl.NumberFormatOptions;
	private readonly nullishFallback: string; // New property for the fallback string

	/**
	 * Creates an instance of NumberFormatter.
	 * @param config - Configuration object for the formatter.
	 */
	constructor(config: NumberFormatterConfig = {}) {
		// Destructure config with default values
		const {
			locale = 'sr-Latn-RS',
			defaultOptions = {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			},
			nullishFallback = '' // Default to an empty string if not provided
		} = config;

		this.locale = locale;
		this.defaultOptions = defaultOptions;
		this.nullishFallback = nullishFallback;
	}

	/**
	 * The core formatting method. All other methods use this internally.
	 * It now handles null and undefined values.
	 * @param value - The number to format, or null/undefined.
	 * @param options - Specific Intl.NumberFormatOptions to override defaults.
	 * @returns The formatted number as a string, or the fallback string.
	 */
	public format(value: number | null | undefined, options?: Intl.NumberFormatOptions): string {
		// --- KEY CHANGE: Handle null and undefined ---
		// The `== null` check conveniently handles both `null` and `undefined`.
		if (value == null) {
			return this.nullishFallback;
		}

		const finalOptions = { ...this.defaultOptions, ...options };
		try {
			return new Intl.NumberFormat(this.locale, finalOptions).format(value);
		} catch (error) {
			console.error(`Error formatting number for locale "${this.locale}":`, error);
			return value.toString();
		}
	}

	/**
	 * Formats a number as a currency value.
	 * @param value - The numeric amount, or null/undefined.
	 * @param currency - The 3-letter ISO 4217 currency code.
	 * @param options - Additional options to override defaults.
	 * @returns The formatted currency string or the fallback string.
	 */
	public formatCurrency(
		value: number | null | undefined,
		currency: string,
		options?: Intl.NumberFormatOptions
	): string {
		const currencyOptions: Intl.NumberFormatOptions = {
			style: 'currency',
			currency,
			...options
		};
		return this.format(value, currencyOptions);
	}

	/**
	 * Formats a number as a standard decimal, with an easy option for fixed decimal places.
	 * @param value The number to format, or null/undefined.
	 * @param options Custom options, including the `fractionDigits` helper.
	 */
	public formatNumber(
		value: number | null | undefined,
		options: CustomDecimalOptions = {}
	): string {
		// Destructure our custom property to separate it from standard Intl options
		const { fractionDigits, ...intlOptions } = options;

		const finalOptions: Intl.NumberFormatOptions = {
			style: 'decimal',
			...intlOptions // Spread the remaining standard Intl options
		};

		// If our convenience property is used, translate it to the correct Intl options
		if (typeof fractionDigits === 'number' && fractionDigits >= 0) {
			finalOptions.minimumFractionDigits = fractionDigits;
			finalOptions.maximumFractionDigits = fractionDigits;
		}

		return this.format(value, finalOptions);
	}

	/**
	 * Formats a number as a percentage.
	 * @param value - The number to format (e.g., 0.75), or null/undefined.
	 * @param options - Custom options, including the `fractionDigits` helper.
	 * @returns The formatted percentage string or the fallback string.
	 */
	public formatPercent(
		value: number | null | undefined,
		options: CustomDecimalOptions = {}
	): string {
		const { fractionDigits, ...intlOptions } = options;

		const finalOptions: Intl.NumberFormatOptions = {
			style: 'percent',
			...intlOptions
		};

		// If the convenience property is used, it takes precedence and prevents conflicts.
		if (typeof fractionDigits === 'number') {
			finalOptions.minimumFractionDigits = fractionDigits;
			finalOptions.maximumFractionDigits = fractionDigits;
		}

		return this.format(value, finalOptions); // Use the original format/formatInternal
	}

	/**
	 * Formats a number with a unit.
	 * @param value - The numeric value, or null/undefined.
	 * @param unit - The unit to use (e.g., 'kilometer', 'liter').
	 * @param options - Additional options to override defaults.
	 * @returns The formatted string with a unit or the fallback string.
	 */
	public formatUnit(
		value: number | null | undefined,
		unit: string,
		options?: Intl.NumberFormatOptions
	): string {
		const unitOptions: Intl.NumberFormatOptions = {
			style: 'unit',
			unit,
			...options
		};
		return this.format(value, unitOptions);
	}

	/**
	 * Formats a large number into a compact, human-readable form.
	 * @param value - The number to format, or null/undefined.
	 * @param options - Additional options like `compactDisplay`.
	 * @returns The formatted compact number string or the fallback string.
	 */
	public formatAsCompact(
		value: number | null | undefined,
		options?: Intl.NumberFormatOptions
	): string {
		const compactOptions: Intl.NumberFormatOptions = {
			notation: 'compact',
			compactDisplay: 'short',
			...options
		};
		return this.format(value, compactOptions);
	}
}
