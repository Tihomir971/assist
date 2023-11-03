<script lang="ts">
	import type { Readable, Writable } from 'svelte/store';

	export let isSelected: Writable<boolean>;
	export let isSomeSubRowsSelected: Readable<boolean>;
</script>

<input
	class="checkbox"
	type="checkbox"
	bind:checked={$isSelected}
	indeterminate={$isSomeSubRowsSelected && !$isSelected}
/>
