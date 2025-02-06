<script lang="ts">
	let { data } = $props();
	let { session, profile } = $derived(data);
</script>

{#if session}
	<pre>{JSON.stringify(profile, null, 2)}</pre>
{/if}
