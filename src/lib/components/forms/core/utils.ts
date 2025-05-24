import type { ComboboxOption } from './types.js';
import { matchSorter } from 'match-sorter';

/**
 * Filter options based on input value using match-sorter
 */
export function filterOptions(options: ComboboxOption[], inputValue: string): ComboboxOption[] {
	if (!inputValue.trim()) {
		return options;
	}

	return matchSorter(options, inputValue, {
		keys: ['label'],
		threshold: matchSorter.rankings.CONTAINS
	});
}

/**
 * Find option by value
 */
export function findOptionByValue(
	options: ComboboxOption[],
	value: number | null | undefined
): ComboboxOption | undefined {
	if (value === undefined || value === null) {
		return undefined;
	}
	return options.find((option) => option.value === value);
}

/**
 * Get display value for selected option
 */
export function getDisplayValue(options: ComboboxOption[], value: number | undefined): string {
	const option = findOptionByValue(options, value);
	return option?.label ?? '';
}
