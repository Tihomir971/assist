/* import { join } from 'path'; */
import type { Config } from 'tailwindcss';
/* import forms from '@tailwindcss/forms'; */
/* import typography from '@tailwindcss/typography'; */
/* import { myPreset } from './src/lib/styles/myPreset'; */
const getColor = (color: string, scale: number) => {
	const colors = Array.from(Array(scale).keys()).reduce(
		(acc, _, i) => {
			acc[i + 1] = `oklch(var(--${color}-${i + 1}) / <alpha-value>)`;
			return acc;
		},
		{} as Record<number | string, string>
	) as Record<string | number, string>;
	colors['DEFAULT'] = `oklch(var(--${color}-max) / <alpha-value>)`;
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
				accent: getColor('color', 16),
				max: 'oklch(var(--color-max) / <alpha-value>)',
				surface: {
					1: 'oklch(var(--surface-1) / <alpha-value>)',
					2: 'oklch(var(--surface-2) / <alpha-value>)',
					3: 'oklch(var(--surface-3) / <alpha-value>)',
					document: 'oklch(var(--surface-document) / <alpha-value>)'
				},
				well: {
					1: 'oklch(var(--well-1) / <alpha-value>)',
					2: 'oklch(var(--well-2) / <alpha-value>)'
				},
				text: {
					1: 'oklch(var(--text-1) / <alpha-value>)',
					2: 'oklch(var(--text-2) / <alpha-value>)'
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
