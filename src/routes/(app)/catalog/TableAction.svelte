<script lang="ts">
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	export let id: number;
</script>

<button
	class="-my-1"
	on:click={() => {
		dispatch('click', { id });
	}}
	><Ellipsis />
</button>
