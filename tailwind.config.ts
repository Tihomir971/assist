/* import { join } from 'path'; */
import type { Config } from 'tailwindcss';
/* import forms from '@tailwindcss/forms'; */
/* import typography from '@tailwindcss/typography'; */
/* import { skeleton } from '@skeletonlabs/tw-plugin'; */
/* import { myCustomTheme } from './skeleton-theme'; */
import { myPreset } from './src/lib/styles/myPreset';

export default {
	darkMode: 'class',
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {}
	},
	plugins: [
		/* forms */
		/* typography */
		/* skeleton({
			themes: {
				custom: [myCustomTheme]
			}
		}) */
	],
	presets: [myPreset]
} satisfies Config;
