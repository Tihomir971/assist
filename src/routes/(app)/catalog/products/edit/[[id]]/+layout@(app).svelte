<script lang="ts">
	let { children } = $props();
</script>

<div class="mx-auto flex w-full flex-col overflow-y-auto p-3">
	{@render children()}
</div>
