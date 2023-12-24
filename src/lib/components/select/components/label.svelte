<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import { getCtx } from '../ctx';

	const {
		elements: { label }
	} = getCtx();
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="block text-neutral-900" use:melt={$label}><slot /></label>
