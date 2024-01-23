<script lang="ts">
	import { goto } from '$app/navigation';
	import { AlignJustify } from 'lucide-svelte';

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
</script>

<!-- <button class="btn btn-square btn-ghost btn-xs" on:click={() => goto(`/catalog/product/${id}`)} -->
<button
	class="btn btn-square btn-ghost btn-sm -my-1"
	on:click={() => {
		dispatch('click');
	}}><AlignJustify size="20" /></button
>
