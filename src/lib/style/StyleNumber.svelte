<script lang="ts">
	import { numberFormat } from '$lib/scripts/format';

	export let value: number | null;
	export let danger: boolean = false;
	export let style: 'decimal' | 'currency' | 'percent' = 'decimal';
	export let fractionDigits: number = 2;
</script>

{#if value !== null && value !== undefined}
	<div class="text-right" class:text-red-500={danger}>
		{numberFormat(value, 'sr-Latn', style, fractionDigits)}
	</div>
{/if}
