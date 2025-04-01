// Function to generate code from name
export function generateCodeFromName(name: string): string {
	const charMap: { [key: string]: string } = {
		ć: 'c',
		č: 'c',
		š: 's',
		đ: 'd',
		ž: 'z',
		Ć: 'C',
		Č: 'C',
		Š: 'S',
		Đ: 'D',
		Ž: 'Z'
	};

	// Replace special characters
	let codeName = name.replace(/[ćčšđžĆČŠĐŽ]/g, (match) => charMap[match] || match);

	// Convert to lowercase and replace spaces with underscores
	codeName = codeName.toLowerCase().replace(/\s+/g, '_');

	// Remove any remaining non-alphanumeric characters (except underscore)
	codeName = codeName.replace(/[^a-z0-9_]/g, '');

	return codeName;
}
