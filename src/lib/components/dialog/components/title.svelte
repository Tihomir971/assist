<script lang="ts">
	import { getCtx } from '../ctx';
	import { melt } from '@melt-ui/svelte';

	export let title: string | undefined = undefined;

	const {
		elements: { title: titleElm }
	} = getCtx();
</script>

<h2 use:melt={$titleElm} class="title">{title}</h2>
