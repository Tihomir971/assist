<script lang="ts">
	import { FileUpload } from '$lib/components/ark';
	import TreeView from '$lib/components/ark/tree-view/TreeView.svelte';
	import type { TreeViewNode } from '$lib/components/ark/tree-view/types';
	import { InputUrl } from '$lib/components/shadcn';
	import { Separator } from '$lib/components/ui/separator/index.js';

	// Sample data for the tree (same as basic.svelte)
	const sampleData: TreeViewNode[] = [
		{
			id: 'node_modules',
			name: 'node_modules',
			children: [
				{ id: 'node_modules/zag-js', name: 'zag-js' },
				{ id: 'node_modules/pandacss', name: 'panda' },
				{
					id: 'node_modules/@types',
					name: '@types',
					children: [
						{ id: 'node_modules/@types/svelte', name: 'svelte' },
						{ id: 'node_modules/@types/vite', name: 'vite' }
					]
				}
			]
		},
		{
			id: 'src',
			name: 'src',
			children: [
				{ id: 'src/App.svelte', name: 'App.svelte' },
				{ id: 'src/main.ts', name: 'main.ts' }
			]
		},
		{ id: 'vite.config', name: 'vite.config.ts' },
		{ id: 'package.json', name: 'package.json' },
		{ id: 'svelte.config.js', name: 'svelte.config.js' },
		{ id: 'readme.md', name: 'README.md' }
	];
</script>

<div class="container mx-auto py-8">
	<h1 class="mb-8 text-3xl font-bold text-gray-900 dark:text-gray-100">TreeView Component Demo</h1>

	<div class="space-y-8">
		<!-- Basic Usage -->
		<section>
			<h2 class="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">Basic Usage</h2>
			<TreeView items={sampleData} label="Project Files" />
		</section>

		<section>
			<Separator class="my-2" />
			<div><InputUrl label="Url" /></div>
			<Separator class="my-2" />
			<FileUpload label="Url" fileType="excel" />
		</section>
	</div>
</div>
