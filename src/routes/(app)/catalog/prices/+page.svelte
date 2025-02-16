<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

{#each data.pricelist as pricelist}
	<div>{pricelist.name}</div>
{/each}
