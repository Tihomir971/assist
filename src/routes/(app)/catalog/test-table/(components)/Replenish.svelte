<script lang="ts">
	import { numberFormat } from '$lib/scripts/format';

	export let levelMin: number;
	export let stock: number;
	export let style: 'decimal' | 'currency' | 'percent' = 'decimal';
	export let fractionDigits: number;
	$: red = levelMin > stock;
</script>

<div class="format-number" class:text-red-500={red}>
	{numberFormat(levelMin ?? 0, 'sr-Latn', style, fractionDigits)}
</div>

<style lang="postcss">
	.format-number {
		text-align: right;
	}
</style>
