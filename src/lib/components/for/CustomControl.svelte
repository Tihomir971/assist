<script lang="ts">
	import { Control, Label } from 'formsnap';
	import type { ComponentProps } from 'svelte';

	let {
		label,
		// Rename the children prop to childrenProp to avoid
		// conflicts with the Control component
		children: childrenProp,
		...restProps
	}: ComponentProps<typeof Control> & {
		label: string;
	} = $props();
</script>

<Control {...restProps}>
	{#snippet children({ props })}
		<div class="flex flex-col gap-2">
			<Label>{label}</Label>
			<!-- Forward the props to the children snippet -->
			{@render childrenProp?.({ props })}
		</div>
	{/snippet}
</Control>
