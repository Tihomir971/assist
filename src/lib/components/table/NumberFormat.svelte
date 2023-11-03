<script lang="ts">
	import { numberFormat } from '$lib/scripts/format';

	export let value: number;
	export let locales: string;
	export let style: 'decimal' | 'currency' | 'percent' = 'decimal';
	export let fractionDigits: number;
</script>

<div class="text-right">{numberFormat(value, locales, style, fractionDigits)}</div>
