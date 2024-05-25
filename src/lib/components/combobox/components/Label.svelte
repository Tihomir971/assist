<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import { getCtx } from '../ctx';
	import { Input } from '..';
	import { Label } from '$lib/components/ui/label';
	const {
		elements: { label, input }
	} = getCtx();
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label
	use:melt={$label}
	class="col-span-3 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
>
	<div class="label">
		<span class="label-text"><slot /></span>
	</div>
	<input
		type="text"
		use:melt={$input}
		{...$$restProps}
		placeholder="Choose..."
		list="searches"
		class="select select-bordered w-full"
	/>
</label>
