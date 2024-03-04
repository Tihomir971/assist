<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	export let id: number;
</script>

<!-- <button class="btn btn-square btn-ghost btn-xs" on:click={() => goto(`/catalog/product/${id}`)} -->
<button
	class="btn btn-square btn-ghost btn-sm -my-1"
	on:click={() => {
		dispatch('click', { id });
	}}><iconify-icon icon="ph:pencil-simple" width="20" height="20"></iconify-icon></button
>
