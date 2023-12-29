<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import { getCtx } from '../ctx';

	const {
		elements: { label: meltLabel }
	} = getCtx();

	export let label: string | undefined = undefined;
</script>

<!-- svelte-ignore a11y-label-has-associated-control -->
<label class="form-control col-span-3" use:melt={$meltLabel}>
	<div class="label">
		{label}
	</div>
</label>
