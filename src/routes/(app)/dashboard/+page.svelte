<script lang="ts">
	let { data } = $props();
	let { session, profile } = $derived(data);
	import DatePicker from '$lib/components/zag/date-picker.svelte';
</script>

{#if session}
	<!-- <pre>{JSON.stringify(session, null, 2)}</pre> -->
	<pre>{JSON.stringify(profile, null, 2)}</pre>
	<DatePicker />
{/if}
