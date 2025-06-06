<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { NumberFormatter } from '$lib/scripts/intl';
	import { cn } from '$lib/utils';

	type Props = {
		value: string;
		iscustomer: boolean;
		priceMarket: {
			name: string;
			pricelist: number | null;
			tax: number | null;
			iscustomer: boolean;
		}[];
		isDanger?: boolean;
	};
	let { value, iscustomer, priceMarket, isDanger }: Props = $props();

	const numberFormatter = new NumberFormatter();
	function calculatePriceWithTax(price: number | null, tax: number | null): number | null {
		if (price === null || tax === null) return null;
		return price * (1 + tax);
	}

	const priceSorted = $derived.by(() =>
		[...priceMarket]
			.filter((item) => item.iscustomer === iscustomer)
			.sort((a, b) => {
				// If both are 0 or null, maintain original order
				if ((!a.pricelist || a.pricelist === 0) && (!b.pricelist || b.pricelist === 0)) return 0;
				// If a is 0 or null, put it at the bottom
				if (!a.pricelist || a.pricelist === 0) return 1;
				// If b is 0 or null, put it at the bottom
				if (!b.pricelist || b.pricelist === 0) return -1;
				// Normal ascending sort for non-zero values
				return a.pricelist - b.pricelist;
			})
	);
</script>

<Tooltip.Provider>
	<Tooltip.Root>
		<Tooltip.Trigger class={cn('w-full text-right', isDanger && 'text-warning')}>
			{value}
		</Tooltip.Trigger>
		<Tooltip.Content
			class="border border-input bg-background text-popover-foreground"
			arrowClasses="bg-background border-b border-input"
		>
			<div class="min-w-[320px]">
				{#each priceSorted as item}
					<div class="grid grid-cols-[1fr_auto_auto] gap-2 py-1">
						<div>{item.name}</div>
						<div class="w-[80px] text-right">
							{numberFormatter.formatNumber(item.pricelist, {
								fractionDigits: 2
							}) ?? '-'}
						</div>
						<div class="w-[80px] text-right">
							{numberFormatter.formatNumber(calculatePriceWithTax(item.pricelist, item.tax), {
								fractionDigits: 2
							}) ?? '-'}
						</div>
					</div>
				{/each}
			</div>
		</Tooltip.Content>
	</Tooltip.Root>
</Tooltip.Provider>
