<script lang="ts">
	let { data } = $props();
	let { session, ad_user } = $derived(data);
</script>

{#if session}
	<pre>{JSON.stringify(ad_user, null, 2)}</pre>
{/if}
<pre>
	{JSON.stringify(session.user, null, 2)}
</pre>
