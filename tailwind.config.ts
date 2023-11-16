/* import { join } from 'path'; */
import type { Config } from 'tailwindcss';
/* import forms from '@tailwindcss/forms'; */
/* import typography from '@tailwindcss/typography'; */
/* import { skeleton } from '@skeletonlabs/tw-plugin'; */
/* import { myCustomTheme } from './skeleton-theme'; */
/* import { myPreset } from './src/lib/styles/myPreset'; */

export default {
	darkMode: 'class',
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
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
	},
	plugins: [
		/* forms */
		/* typography */
		/* skeleton({
			themes: {
				custom: [myCustomTheme]
			}
		}) */
	]
	/* presets: [myPreset] */
} satisfies Config;
