export function labelByValue(
	value: number | null | undefined,
	object: { value: number; label: string }[]
): string {
	if (value == null) return '';
	return object?.find((v) => v.value === value)?.label ?? '';
}
