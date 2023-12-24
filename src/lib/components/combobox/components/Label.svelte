<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import { getCtx } from '../ctx';
	import { Input } from '..';

	const {
		elements: { label, input }
	} = getCtx();
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label use:melt={$label} class="form-control col-span-3">
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
