<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="flex-1 overflow-y-auto">
	<div class="p-4">
		{@render children()}
	</div>
</div>
