<script lang="ts">
	import { Checkbox, Label, useId, type WithoutChildrenOrChild } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	import PhCheck from '~icons/ph/check';
	import PhMinus from '~icons/ph/minus';

	let {
		id = useId(),
		checked = $bindable(false),
		indeterminate = $bindable(false),
		ref = $bindable(null),
		label = undefined,
		labelRef = $bindable(null),
		class: className,
		...restProps
	}: WithoutChildrenOrChild<Checkbox.RootProps> & {
		label?: string | undefined;
		labelRef?: HTMLLabelElement | null;
	} = $props();
</script>

<div class="flex flex-row items-start space-y-0 space-x-3">
	<Checkbox.Root
		{id}
		bind:checked
		bind:ref
		{...restProps}
		class="peer box-content size-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
	>
		{#snippet children({ checked, indeterminate })}
			<div class="flex size-4 items-center justify-center text-current">
				{#if indeterminate}
					<PhMinus class="size-3.5" />
				{:else}
					<PhCheck class={cn('size-3.5', !checked && 'text-transparent')} />
				{/if}
			</div>
		{/snippet}
	</Checkbox.Root>
	<div class="space-y-1 leading-none">
		<Label.Root
			for={id}
			bind:ref={labelRef}
			class="leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
		>
			{label}
		</Label.Root>
	</div>
</div>
