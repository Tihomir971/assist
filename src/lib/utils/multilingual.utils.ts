import type { MultilingualData, LocaleLookup } from '$lib/types/multilingual.types';

/**
 * Get the best available translation for a given locale with fallback
 */
export function getTranslation(
  data: MultilingualData | null | undefined,
  preferredLocale: string,
  fallbackLocale: string = 'en-US'
): string {
  if (!data || typeof data !== 'object') return '';

  // Try preferred locale first
  if (data[preferredLocale] && data[preferredLocale].trim()) {
    return data[preferredLocale];
  }

  // Try fallback locale
  if (data[fallbackLocale] && data[fallbackLocale].trim()) {
    return data[fallbackLocale];
  }

  // Return first available translation
  const firstAvailable = Object.values(data).find(value => value && value.trim());
  return firstAvailable || '';
}

/**
 * Check if multilingual data has any content
 */
export function hasAnyContent(data: MultilingualData | null | undefined): boolean {
  if (!data || typeof data !== 'object') return false;
  return Object.values(data).some(value => value && value.trim().length > 0);
}

/**
 * Get locales that have content
 */
export function getFilledLocales(data: MultilingualData | null | undefined): string[] {
  if (!data || typeof data !== 'object') return [];
  return Object.keys(data).filter(locale => data[locale] && data[locale].trim().length > 0);
}

/**
 * Get locales that are empty
 */
export function getEmptyLocales(
  data: MultilingualData | null | undefined,
  availableLocales: string[]
): string[] {
  if (!data || typeof data !== 'object') return availableLocales;
  return availableLocales.filter(locale => !data[locale] || !data[locale].trim());
}

/**
 * Clean multilingual data by removing empty values
 */
export function cleanMultilingualData(data: MultilingualData | null | undefined): MultilingualData {
  if (!data || typeof data !== 'object') return {};
  
  const cleaned: MultilingualData = {};
  Object.entries(data).forEach(([locale, value]) => {
    if (value && value.trim().length > 0) {
      cleaned[locale] = value.trim();
    }
  });
  
  return cleaned;
}

/**
 * Merge multilingual data with defaults
 */
export function mergeMultilingualData(
  current: MultilingualData | null | undefined,
  defaults: MultilingualData
): MultilingualData {
  const currentData = current || {};
  return { ...defaults, ...currentData };
}

/**
 * Copy content from one locale to another
 */
export function copyLocaleContent(
  data: MultilingualData,
  fromLocale: string,
  toLocale: string
): MultilingualData {
  if (!data[fromLocale]) return data;
  
  return {
    ...data,
    [toLocale]: data[fromLocale]
  };
}

/**
 * Validate required locales have content
 */
export function validateRequiredLocales(
  data: MultilingualData | null | undefined,
  requiredLocales: string[]
): { isValid: boolean; missingLocales: string[] } {
  if (!data || typeof data !== 'object') {
    return { isValid: false, missingLocales: requiredLocales };
  }

  const missingLocales = requiredLocales.filter(
    locale => !data[locale] || !data[locale].trim()
  );

  return {
    isValid: missingLocales.length === 0,
    missingLocales
  };
}

/**
 * Format locale display name
 */
export function formatLocaleDisplay(locale: LocaleLookup): string {
  return locale.isDefault ? `${locale.label} (Default)` : locale.label;
}

/**
 * Sort locales with default first
 */
export function sortLocales(locales: LocaleLookup[]): LocaleLookup[] {
  return [...locales].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return a.label.localeCompare(b.label);
  });
}
