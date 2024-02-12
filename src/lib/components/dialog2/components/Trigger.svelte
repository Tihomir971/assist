<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import { getCtx } from '..';

	const {
		elements: { trigger }
	} = getCtx();
</script>

<button use:melt={$trigger} class="btn btn-secondary">Add</button>
