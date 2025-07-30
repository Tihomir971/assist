<script lang="ts">
	import { JsonTreeView } from '@ark-ui/svelte/json-tree-view';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import './ap.css';
	let { data } = $props();
	let { session, ad_user } = $derived(data);
</script>

<!-- {#if session}
	<pre>{JSON.stringify(ad_user, null, 2)}</pre>
{/if}
<pre>
	{JSON.stringify(session.user, null, 2)}
</pre> -->

<JsonTreeView.Root data={ad_user}>
	<JsonTreeView.Tree class="mt-5 px-2 ">
		{#snippet arrow()}
			<ChevronRightIcon />
		{/snippet}
	</JsonTreeView.Tree>
</JsonTreeView.Root>
<JsonTreeView.Root data={session}>
	<JsonTreeView.Tree>
		{#snippet arrow()}
			<ChevronRightIcon />
		{/snippet}
	</JsonTreeView.Tree>
</JsonTreeView.Root>
