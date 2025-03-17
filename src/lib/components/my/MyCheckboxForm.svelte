<script lang="ts">
	import { Checkbox, Label, useId, type WithoutChildrenOrChild } from 'bits-ui';
	import PhCheckBold from '~icons/ph/check-bold';
	import PhMinusBold from '~icons/ph/minus-bold';

	let {
		id = useId(),
		checked = $bindable(false),
		ref = $bindable(null),
		labelRef = $bindable(null),
		labelText,
		...restProps
	}: WithoutChildrenOrChild<Checkbox.RootProps> & {
		labelText: string;
		labelRef?: HTMLLabelElement | null;
	} = $props();
</script>

<div class="flex items-center space-x-3">
	<Checkbox.Root
		bind:checked
		bind:ref
		{...restProps}
		class="data-[state=unchecked]:border-border-input data-[state=unchecked]:hover:border-dark-40 peer inline-flex size-[25px] items-center justify-center rounded-md border border-muted bg-foreground transition-all duration-150 ease-in-out active:scale-[0.98] data-[state=unchecked]:bg-background"
	>
		{#snippet children({ checked, indeterminate })}
			<div class="inline-flex items-center justify-center text-background">
				{#if indeterminate}
					<PhMinusBold class="size-[15px]" />
				{:else if checked}
					<PhCheckBold class="size-[15px]" />
				{/if}
			</div>
		{/snippet}
	</Checkbox.Root>
	<Label.Root
		for={id}
		bind:ref={labelRef}
		class="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
	>
		{labelText}
	</Label.Root>
</div>
