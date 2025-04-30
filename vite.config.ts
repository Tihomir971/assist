import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		tailwindcss(),
		Icons({
			compiler: 'svelte'
		})
	],
	build: {
		terserOptions: {
			compress: {
				drop_console: false // Keep console logs
			},
			mangle: true // Keep mangling enabled
		}
		// Optional: If you only want logs in preview, not final deployment
		// minify: 'terser', // Ensure terser is used
	},
	define: {
		'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
		'import.meta.env.PACKAGE_VERSION': JSON.stringify(process.env.npm_package_version)
	}
});
