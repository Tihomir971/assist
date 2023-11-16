/* Script by https://github.com/viktorbonino/radix-themes-tw */
import type { Config } from 'tailwindcss';

/* const colorScale = 13; */
/* const openPropsColors = [
	'gray',
	'stone',
	'red',
	'pink',
	'purple',
	'violet',
	'indigo',
	'blue',
	'cyan',
	'teal',
	'green',
	'lime',
	'yellow',
	'orange',
	'choco',
	'brown',
	'sand',
	'camo',
	'jungle'
]; */
/* const getColor = (color: string, scale: number) => {
	const colors = Array.from(Array(scale).keys()).reduce(
		(acc, _, i) => {
			acc[i + 1] = `hsl(var(--${color}-${i}-hsl) / <alpha-value>)`;
			return acc;
		},
		{} as Record<number | string, string>
	) as Record<string | number, string>;

	return colors;
}; */

/* const getColors = (arr: string[]) => {
	const colors = arr.reduce(
		(acc, color) => {
			acc[color] = getColor(color, colorScale);
			return acc;
		},
		{} as Record<string, Record<number | string, string>>
	);
	return { ...colors };
}; */

export const myPreset: Config = {
	darkMode: 'class',
	content: [],
	theme: {
		boxShadow: {
			1: 'var(--shadow-1)',
			2: 'var(--shadow-2)',
			3: 'var(--shadow-3)',
			4: 'var(--shadow-4)',
			5: 'var(--shadow-5)',
			6: 'var(--shadow-6)',
			inner: 'var(--inner-shadow-0)'
		},

		extend: {
			colors: {
				/* transparent: 'transparent', */
				/* current: 'currentColor', */
				/*	indigo: getColor('indigo', colorScale)
				 ...getColors(radixGrayColors, true),
	gray: getGrayColor('gray', colorScale),*/
				/* ...getColors(openPropsColors), */
				text: {
					1: 'hsl(var(--text-1) / <alpha-value>)',
					2: 'hsl(var(--text-2) / <alpha-value>)'
				},
				theme: {
					DEFAULT: 'hsl(var(--theme) / <alpha-value>)',
					hover: 'hsl(var(--theme-hover) / <alpha-value>)',
					active: 'hsl(var(--theme-active) / <alpha-value>)'
				},
				surface: {
					1: 'hsl(var(--surface-1) / <alpha-value>)',
					2: 'hsl(var(--surface-2) / <alpha-value>)',
					3: 'hsl(var(--surface-3) / <alpha-value>)',
					4: 'hsl(var(--surface-4) / <alpha-value>)'
				}
			}
		}
	}
};
