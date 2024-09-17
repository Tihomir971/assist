<script lang="ts">
	import { numberFormat } from '$lib/scripts/format';

	export let value: number | null;
	export let danger: boolean = false;
	export let style: 'decimal' | 'currency' | 'percent' = 'decimal';
	export let fractionDigits: number = 2;
	export let action: boolean = false;
</script>

{#if value !== null && value !== undefined}
	<div class="flex items-center justify-end text-right" class:text-red-500={danger}>
		{#if action}
			<span class="mr-1 text-red-500">*</span>
		{/if}
		<span>{numberFormat(value, 'sr-Latn', style, fractionDigits)}</span>
	</div>
{/if}
