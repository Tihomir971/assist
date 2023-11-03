export const getNumber = (formData: FormData, property: string) => {
	const value = formData.get(property);
	if (!value) return null;
	return Number(value);
};
export const getString = (formData: FormData, property: string) => {
	const value = formData.get(property);
	if (!value) return null;
	return value.toString();
};
export const getBoolean = (formData: FormData, property: string) => {
	const value = formData.get(property);
	if (!value) return false;
	return !!value;
};
