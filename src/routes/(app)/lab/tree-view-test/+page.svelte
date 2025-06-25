<script lang="ts">
	import TreeView from '$lib/components/zag/tree-view/tree-view.svelte';
	import { data as items } from './data';

	// For testing, let's check 'Node 1.1' which has value 11
	let checkedValue = $state<number[]>([11]);
	let selectedValue = $state<string[]>(['11']);
</script>

<main class="p-4">
	<h1 class="mb-4 text-2xl font-bold">Tree View Test</h1>
	<div class="flex gap-8">
		<div class="w-72 rounded-md border p-2">
			<TreeView {items} selectionMode="multiple" bind:checkedValue bind:selectedValue />
		</div>
		<div>
			<h2 class="text-lg font-semibold">State:</h2>
			<div class="mt-2">
				<h3 class="font-medium">Selected Value:</h3>
				<pre>{JSON.stringify(selectedValue, null, 2)}</pre>
			</div>
			<div class="mt-2">
				<h3 class="font-medium">Checked Value:</h3>
				<pre>{JSON.stringify(checkedValue, null, 2)}</pre>
			</div>
		</div>
	</div>
</main>
