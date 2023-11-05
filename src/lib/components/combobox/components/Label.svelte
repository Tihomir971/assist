<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import { getCtx } from '../ctx';

	const {
		elements: { label }
	} = getCtx();
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label use:melt={$label} class="label">
	<span>Choose your favorite manga:</span>
</label>
