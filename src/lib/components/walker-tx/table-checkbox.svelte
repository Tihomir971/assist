<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = {
		checked?: boolean | 'indeterminate';
	} & Omit<HTMLInputAttributes, 'checked'>;

	let { checked = false, ...inputProps }: Props = $props();

	$effect(() => {
		if (checked === 'indeterminate') {
			input.indeterminate = true;
		} else {
			input.indeterminate = false;
		}
	});

	let input: HTMLInputElement;
</script>

<input
	type="checkbox"
	bind:this={input}
	checked={checked === true}
	class="size-4"
	{...inputProps}
/>
