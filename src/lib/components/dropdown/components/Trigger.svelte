<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import { getCtx } from '../ctx';

	const {
		elements: { trigger }
	} = getCtx();
</script>

<button use:melt={$trigger} type="button" {...$$restProps}>
	<slot />
</button>
