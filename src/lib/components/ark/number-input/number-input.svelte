<script lang="ts">
	import './number-input.css';

	import { NumberInput, type NumberInputRootBaseProps } from '@ark-ui/svelte/number-input';
	import { useLocaleContext } from '@ark-ui/svelte/locale';

	import PhCaretUp from '~icons/ph/caret-up';
	import PhCaretDown from '~icons/ph/caret-down';
	import { Field } from '@ark-ui/svelte/field';
	interface Props extends Omit<NumberInputRootBaseProps, 'value'> {
		value?: number | undefined;
	}
	const conLocale = useLocaleContext();
	let { value = $bindable(), name, locale = conLocale().locale, ...rootProps }: Props = $props();
</script>

<input type="hidden" {name} {value} />

<NumberInput.Root
	allowMouseWheel
	{locale}
	value={value?.toLocaleString(locale)}
	onValueChange={(details) => {
		value = details.valueAsNumber;
	}}
	{...rootProps}
>
	<!-- 	<NumberInput.Label
		>Enter number:<Field.RequiredIndicator>*</Field.RequiredIndicator></NumberInput.Label
	> -->
	<NumberInput.Control class="rounded-sm border border-amber-300">
		<NumberInput.Input />
		<div>
			<NumberInput.IncrementTrigger><PhCaretUp /></NumberInput.IncrementTrigger>
			<NumberInput.DecrementTrigger><PhCaretDown /></NumberInput.DecrementTrigger>
		</div>
	</NumberInput.Control>
</NumberInput.Root>
