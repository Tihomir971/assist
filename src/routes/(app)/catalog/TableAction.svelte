<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Drawer } from 'vaul-svelte';
	const dispatch = createEventDispatcher();
	export let id: number;
</script>

<button
	class="-my-1"
	on:click={() => {
		dispatch('click', { id });
	}}><iconify-icon icon="ph:pencil-simple" width="20" height="20"> Icon</iconify-icon></button
>
