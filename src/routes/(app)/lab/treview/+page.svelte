<script lang="ts">
	import TreeView from './TreeView.svelte';

	let checkedValue = $state<string[]>(['node-1']); // Initial checked value
	$inspect('checkedValueParent', checkedValue);
</script>

<main>
	<TreeView bind:checkedValue />
</main>
