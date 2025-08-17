<script lang="ts">
	import { Checkbox, type CheckboxRootBaseProps } from '@ark-ui/svelte/checkbox';
	import { CheckIcon, MinusIcon } from '@lucide/svelte';
	import './checkbox.css';

	interface Props extends CheckboxRootBaseProps {
		label?: string | undefined;
	}

	let { checked = $bindable(), label, ...rootProps }: Props = $props();
	$inspect('label', label);
</script>

<Checkbox.Root
	{...rootProps}
	bind:checked
	class="ark-checkbox checkbox__root checkbox__root--size_md"
>
	<Checkbox.Control class="ark-checkbox checkbox__control checkbox__control--size_md">
		<Checkbox.Indicator>
			<CheckIcon size="14" />
		</Checkbox.Indicator>
		<Checkbox.Indicator indeterminate>
			<MinusIcon size="14" />
		</Checkbox.Indicator>
	</Checkbox.Control>
	{#if label}
		<Checkbox.Label class="ark-checkbox checkbox__label checkbox__label--size_md"
			>{label}</Checkbox.Label
		>
	{/if}
	<Checkbox.HiddenInput />
</Checkbox.Root>
