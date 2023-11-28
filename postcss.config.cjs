module.exports = {
	plugins: {
		"postcss-preset-env": {
			minimumVendorImplementations: 2,
			features: {
				'nesting-rules': false,
				'custom-media-queries': true,
				'media-query-ranges': true
			}
		},
		'tailwindcss/nesting': {},
		tailwindcss: {},
		/* '@csstools/postcss-oklab-function': { 'preserve': true }, */
		autoprefixer: {},
	},
}