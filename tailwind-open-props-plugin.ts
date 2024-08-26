import plugin from 'tailwindcss/plugin';
import openProps from 'open-props';
//import openProps from "https://unpkg.com/open-props@beta.5";

type OpenPropsValue = string | number;
type OpenPropsObject = Record<string, OpenPropsValue>;

// Define a type that matches Tailwind's expectations for CSS rules
//type TailwindCSSRuleObject = Record<string, string | Record<string, string>>;

export default plugin(function ({ addBase }) {
	const rootStyles = Object.entries(openProps as OpenPropsObject).reduce(
		(acc, [key, value]) => {
			acc[key] = String(value);
			return acc;
		},
		{} as Record<string, string>
	);
	// Add Open Props as base styles
	addBase({
		':root': {
			...rootStyles,
			'--link': 'var(--indigo-7-hsl)',
			'--link-visited': 'var(--purple-7-hsl)',
			'--text-1': 'var(--gray-12-hsl)',
			'--text-2': 'var(--gray-7-hsl)',
			'--surface-1': 'var(--gray-0-hsl)',
			'--surface-2': 'var(--gray-2-hsl)',
			'--surface-3': 'var(--gray-3-hsl)',
			'--surface-4': 'var(--gray-4-hsl)',
			'--scrollthumb-color': 'var(--gray-7-hsl)'
		},
		'.dark': {
			'--surface-1': 'var(--gray-6-hsl)',
			'--surface-2': 'var(--gray-7-hsl)',
			'--surface-3': 'var(--gray-8-hsl)',
			'--surface-document': 'var(--gray-9-hsl)',
			'--well-1': 'var(--gray-10-hsl)',
			'--well-2': 'var(--gray-11-hsl)',
			'--text-1': 'var(--gray-0-hsl)',
			'--text-2': 'var(--gray-4-hsl)',

			'--link': 'var(--indigo-3-hsl)',
			'--link-visited': 'var(--purple-3-hsl)',

			'--scrollthumb-color': 'var(--gray-6-hsl)',
			'--shadow-strength': '10%',
			'--shadow-color': '220 40% 2%',
			'--inner-shadow-highlight':
				'inset 0 -.5px 0 0 rgba(255, 255, 255, .06667), inset 0 .5px 0 0 rgba(0, 0, 0, .46667)'
			/*  '--theme-bg': 'var(--gray-9)',
		  '--theme-text': 'var(--gray-0)', */
		}
	});

	// Create utilities for Open Props
	/* 	const utilities = Object.entries(openProps as OpenPropsObject).reduce(
		(acc, [key, value]) => {
			const utilityName = `op-${key.replace('--', '')}`;
			acc[`.${utilityName}`] = { [key]: String(value) };
			return acc;
		},
		{} as Record<string, Record<string, string>>
	); */
	// Add theme-specific utilities
	/* 	utilities['.theme-bg'] = { backgroundColor: 'var(--theme-bg)' };
	utilities['.theme-text'] = { color: 'var(--theme-text)' }; */
	// Convert utilities to the format expected by addUtilities
	/* const tailwindUtilities = Object.entries(utilities).map(([className, styles]) => ({
		[className]: styles
	})) as TailwindCSSRuleObject[]; */
	/* 	addUtilities(tailwindUtilities); */
});
