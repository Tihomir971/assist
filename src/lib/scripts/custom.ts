export function getLabelByValue(
	value: number | null | undefined,
	object: { value: number; label: string }[]
): string {
	if (value == null) return '';
	return object?.find((v) => v.value === value)?.label ?? '';
}

/**
 * Returns the first object from the array where the `value` matches the given value.
 *
 * @template T - Type of the objects in the array, which must contain at least a `value: number` property.
 * @param value - The value to search for. If `null` or `undefined`, returns `undefined`.
 * @param object - An array of objects with at least a `value: number` field.
 * @returns The matched object from the array or `undefined` if not found.
 *
 * @example
 * const options = [{ value: 1, label: 'One' }, { value: 2, label: 'Two' }];
 * const result = getObjectByValue(1, options); // { value: 1, label: 'One' }
 */
export function getObjectByValue<T extends { value: number }>(
	value: number | null | undefined,
	object: T[]
): T | undefined {
	if (value == null) return undefined;
	return object.find((v) => v.value === value);
}
