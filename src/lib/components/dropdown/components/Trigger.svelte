<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import { getCtx } from '../ctx';

	const {
		elements: { trigger }
	} = getCtx();
</script>

<div class="grid place-content-center">
	<button use:melt={$trigger} type="button" {...$$restProps}>
		<slot />
	</button>
</div>

<style lang="postcss">
	button {
		padding-block: 0px;
		background-color: transparent;
		border-width: 0px;
		box-shadow: none;
	}
</style>
