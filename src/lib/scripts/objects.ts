export function findLabelByValue(
	object: { value: number; label: string }[] | null,
	value: number | null
) {
	if (!object || !value) return null;

	const warehouse = object.find((wh) => wh.value === value);
	return warehouse ? warehouse.label : null;
}
