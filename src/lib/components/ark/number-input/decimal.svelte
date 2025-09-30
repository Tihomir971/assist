<script lang="ts">
	import { NumberInput } from '@ark-ui/svelte/number-input';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import type { NumberInputRootBaseProps } from '@ark-ui/svelte/number-input';
	import { useLocaleContext } from '@ark-ui/svelte/locale';

	const localeContext = useLocaleContext();

	type Props = Omit<NumberInputRootBaseProps, 'value'> & {
		value?: number | null;
		label?: string;
		step?: number;
	};
	let {
		value = $bindable(),
		locale = localeContext().locale,
		label,
		...restProps
	}: Props = $props();
	$inspect(value);

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

<div class="flex min-h-32 items-center justify-center">
	<NumberInput.Root
		{...restProps}
		allowMouseWheel
		value={value?.toLocaleString(locale)}
		{locale}
		pattern={getNumberRegex()}
		formatOptions={{
			minimumFractionDigits: 3
		}}
		onValueChange={(valueChangeDetails) => {
			value = Number.isNaN(valueChangeDetails.valueAsNumber)
				? null
				: valueChangeDetails.valueAsNumber;
		}}
		class="w-64"
		>{#if label}
			<NumberInput.Label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
				{label}
			</NumberInput.Label>
		{/if}
		<NumberInput.Control
			class="grid h-9 grid-cols-[1fr_24px] grid-rows-2 overflow-hidden rounded-lg border border-gray-200 transition-all focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/50 dark:border-gray-700 dark:focus-within:border-blue-400/50 dark:focus-within:ring-blue-400/50"
		>
			<NumberInput.Input
				class="row-span-2 border-none bg-background px-3 py-1 text-right text-sm text-foreground outline-hidden focus:outline-hidden focus-visible:outline-hidden"
			/>
			<NumberInput.IncrementTrigger
				class="flex cursor-pointer items-center justify-center border-l border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
			>
				<ChevronUp class="h-3 w-3" />
			</NumberInput.IncrementTrigger>
			<NumberInput.DecrementTrigger
				class="flex cursor-pointer items-center justify-center border-t border-l border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
			>
				<ChevronDown class="h-3 w-3" />
			</NumberInput.DecrementTrigger>
		</NumberInput.Control>
		<div class="mt-3 text-xs text-gray-500 dark:text-gray-400">
			Step: 0.001, up to 5 decimal places
		</div>
	</NumberInput.Root>
</div>
