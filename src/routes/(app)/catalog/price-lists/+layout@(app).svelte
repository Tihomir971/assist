<script lang="ts">
	let { children } = $props();
</script>

<div class="mx-auto w-full min-w-6xl p-3">
	{@render children()}
</div>
