<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let bpartners = $derived(data.bpartner);
</script>

<div>
	{#each bpartners as bpartner}
		<div class="font-medium">{bpartner.display_name}</div>
	{/each}
</div>
