<script lang="ts">
	let { children } = $props();
</script>

<main class="relative flex-1 overflow-y-auto">
	{@render children()}
</main>
