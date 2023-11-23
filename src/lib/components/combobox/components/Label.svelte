<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import { getCtx } from '../ctx';
	import { Input } from '..';

	const {
		elements: { label }
	} = getCtx();
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label use:melt={$label}>
	<span><slot /></span>
	<Input />
</label>
