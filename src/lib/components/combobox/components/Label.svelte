<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import { getCtx } from '../ctx';
	import { Input } from '..';

	const {
		elements: { label, input }
	} = getCtx();
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<div>
	<label use:melt={$label}><slot /></label>
	<input type="text" use:melt={$input} {...$$restProps} placeholder="Choose..." list="searches" />
</div>
