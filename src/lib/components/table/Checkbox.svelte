<script lang="ts">
	import type { Readable, Writable } from 'svelte/store';
	export let isSelected: Writable<boolean>;
	export let isSomeSubRowsSelected: Readable<boolean>;
</script>

<label>
	<input
		class="peer box-content flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary text-current ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[disabled=true]:cursor-not-allowed data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[disabled=true]:opacity-50"
		type="checkbox"
		bind:checked={$isSelected}
		indeterminate={$isSomeSubRowsSelected && !$isSelected}
	/>
</label>
