<script lang="ts">
	import { Checkbox, type CheckboxRootBaseProps } from '@ark-ui/svelte/checkbox';
	import { CheckIcon, MinusIcon } from '@lucide/svelte';

	interface Props extends CheckboxRootBaseProps {
		label?: string | undefined;
	}

	let { checked = $bindable(), label, ...rootProps }: Props = $props();
</script>

<Checkbox.Root {...rootProps} bind:checked class="flex cursor-pointer items-center gap-3">
	<Checkbox.Control
		class="flex size-4 items-center justify-center rounded-sm border ring-offset-background transition-all duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden data-hover:border-primary data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary "
	>
		<Checkbox.Indicator>
			<CheckIcon class="h-3.5 w-3.5 " />
		</Checkbox.Indicator>
		<Checkbox.Indicator indeterminate>
			<MinusIcon class="h-3.5 w-3.5 " />
		</Checkbox.Indicator>
	</Checkbox.Control>
	{#if label}
		<Checkbox.Label class="cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-100"
			>{label}
		</Checkbox.Label>
	{/if}
	<Checkbox.HiddenInput />
</Checkbox.Root>
