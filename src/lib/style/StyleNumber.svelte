<script lang="ts">
	import { numberFormat } from '$lib/scripts/format';

	export let value: number;
	export let style: 'decimal' | 'currency' | 'percent' = 'decimal';
	export let fractionDigits: number;
</script>

<div class="format-number">{numberFormat(value, 'sr-Latn', style, fractionDigits)}</div>

<style lang="postcss">
	.format-number {
		text-align: right;
	}
</style>
