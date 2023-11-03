<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let images: (string | null)[];
</script>

<div class="card grid grid-cols-6 gap-4 p-4">
	{#each images as image, i}
		<button type="button" on:click={() => dispatch('select', { i })}>
			<img class="rounded-container-token" src={image} alt={image} loading="lazy" />
		</button>
	{/each}
</div>
