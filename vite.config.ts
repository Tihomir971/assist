import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
//import { sveltePhosphorOptimize } from 'phosphor-svelte/vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	define: {
		'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
	}
});
