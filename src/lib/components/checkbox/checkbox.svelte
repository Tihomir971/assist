<script lang="ts">
	import PhMinusBold from '$lib/icons/PhMinusBold.svelte';
	import { cn } from '$lib/scripts/tailwind';
	import { Checkbox as CheckboxPrimitive } from 'bits-ui';
	//import Check from 'svelte-radix/Check.svelte';

	type $$Props = CheckboxPrimitive.Props;
	type $$Events = CheckboxPrimitive.Events;

	let className: $$Props['class'] = undefined;
	export let checked: $$Props['checked'] = false;
	export { className as class };
</script>

<CheckboxPrimitive.Root class={cn('checkbox', className)} bind:checked on:click {...$$restProps}>
	<CheckboxPrimitive.Indicator
		class={cn('flex h-6 w-6 items-center justify-center text-current')}
		let:isChecked
		let:isIndeterminate
	>
		{#if isIndeterminate}
			<PhMinusBold class="w-5" />
			<!-- <iconify-icon icon="ph:minus-bold" width="22" height="22"></iconify-icon> -->
		{/if}
	</CheckboxPrimitive.Indicator>
</CheckboxPrimitive.Root>
