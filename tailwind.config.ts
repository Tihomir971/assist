/* import { join } from 'path'; */
import type { Config } from 'tailwindcss';
/* import forms from '@tailwindcss/forms'; */
/* import typography from '@tailwindcss/typography'; */
/* import { myPreset } from './src/lib/styles/myPreset'; */
/* const getColor = (color: string, scale: number) => {
	const colors = Array.from(Array(scale).keys()).reduce(
		(acc, _, i) => {
			acc[i + 1] = `oklch(var(--${color}-${i + 1}) / <alpha-value>)`;
			return acc;
		},
		{} as Record<number | string, string>
	) as Record<string | number, string>;
	colors['DEFAULT'] = `oklch(var(--${color}-max) / <alpha-value>)`;
	return colors;
}; */
const getColorOKLCH = (scale: number) => {
	const colors = Array.from(Array(scale).keys()).reduce(
		(acc, _, i) => {
			acc[i + 1] = `var(--color-${i + 1})`;
			return acc;
		},
		{} as Record<number | string, string>
	) as Record<string | number, string>;
	colors['DEFAULT'] = `var(--brand)`;
	return colors;
};

export default {
	darkMode: 'class',
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			boxShadow: {
				test: 'var(--shadow-5)'
			},
			colors: {
				accent: getColorOKLCH(16),
				text: {
					1: 'var(--text-1)',
					2: 'var(--text-2)'
				},
				surface: {
					1: 'var(--surface-1)',
					2: 'var(--surface-2)',
					3: 'var(--surface-3)',
					4: 'var(--surface-4)'
				},
				well: {
					1: 'var(--well-1)',
					2: 'var(--well-2)'
				}

				/* transparent: 'transparent', */
				/* current: 'currentColor', */
				/* indigo: getColor('indigo', colorScale)
				/* ...getColors(radixGrayColors, true), */
			}
		}
	},
	plugins: [
		/* forms */
		/* typography */
	]
	/* presets: [myPreset] */
} satisfies Config;
