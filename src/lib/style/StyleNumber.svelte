<script lang="ts">
	import { numberFormat } from '$lib/scripts/format';

	export let value: number | null;
	export let style: 'decimal' | 'currency' | 'percent' = 'decimal';
	export let fractionDigits: number = 2;
</script>

{#if value !== null && value !== undefined}
	<div class="format-number">{numberFormat(value, 'sr-Latn', style, fractionDigits)}</div>
{/if}

<style lang="postcss">
	.format-number {
		text-align: right;
	}
</style>
