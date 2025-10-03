<script lang="ts">
	import { NumberInput } from '@ark-ui/svelte/number-input';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import type { NumberInputRootBaseProps } from '@ark-ui/svelte/number-input';
	import { useLocaleContext } from '@ark-ui/svelte/locale';

	const localeContext = useLocaleContext();

	type Props = Omit<NumberInputRootBaseProps, 'value' | 'readOnly'> & {
		value?: number | null;
		readonly?: boolean;
		label?: string;
		step?: number;
	};
	let {
		value = $bindable(),
		readonly,
		locale = localeContext().locale,
		label,
		name,
		...restProps
	}: Props = $props();

	function getNumberRegex() {
		const nf = new Intl.NumberFormat(locale);
		const sample = nf.format(1234567.89);

		// Extract decimal and group separators
		const parts = sample.match(/(\D+)/g);
		const group = parts?.[0]?.trim() ?? ',';
		const decimal = parts?.[1]?.trim() ?? '.';

		return `^\\d{1,3}(?:\\${group}\\d{3})*(?:\\${decimal}\\d+)?$`;
	}
</script>

<div class="flex items-center justify-center">
	<input type="hidden" {name} value={Number.isNaN(value) ? undefined : value?.toString()} />
	<NumberInput.Root
		{...restProps}
		{locale}
		allowMouseWheel
		value={value?.toLocaleString(locale)}
		readOnly={readonly}
		pattern={getNumberRegex()}
		onValueChange={(valueChangeDetails) => {
			if (isNaN(valueChangeDetails.valueAsNumber)) {
				return;
			}
			value = valueChangeDetails.valueAsNumber;
		}}
		class="flex w-full flex-col gap-2"
	>
		{#if label}
			<NumberInput.Label class="peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
				{label}
				<span class="ml-1 text-destructive">*</span>
			</NumberInput.Label>
		{/if}
		<NumberInput.Control
			class="grid w-full grid-cols-[1fr_24px] grid-rows-2 overflow-hidden border shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring focus-visible:outline-none"
		>
			<NumberInput.Input
				class="row-span-2 border-none px-3 py-1 text-right text-base text-foreground outline-hidden placeholder:text-muted-foreground focus-within:outline-hidden focus:outline-hidden focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
			/>
			<NumberInput.IncrementTrigger class="flex items-center justify-center border-l">
				<ChevronUp class="h-3 w-3" />
			</NumberInput.IncrementTrigger>
			<NumberInput.DecrementTrigger class="flex items-center justify-center border-t border-l">
				<ChevronDown class="h-3 w-3" />
			</NumberInput.DecrementTrigger>
		</NumberInput.Control>
		<div class="text-xs text-gray-500 dark:text-gray-400">Step: 0.001, up to 5 decimal places</div>
	</NumberInput.Root>
</div>
