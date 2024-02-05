<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import { getCtx } from './ctx';
	//	import { capitalize } from '$lib/helpers/capitalize';

	const {
		elements: { button }
	} = getCtx();
</script>

<button {...$$restProps} use:melt={$button} on:click><slot /></button>
