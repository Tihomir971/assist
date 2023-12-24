<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import { setCtx } from '../ctx';
	import { fade, fly } from 'svelte/transition';
	import { X } from 'lucide-svelte';

	const {
		elements: { trigger, portalled, overlay, content, close, title, description },
		states: { open }
	} = setCtx({});
</script>

<div use:melt={$portalled}>
	{#if $open}
		<div use:melt={$overlay} class="overlay" transition:fade={{ duration: 150 }} />
		<div
			use:melt={$content}
			class="content"
			transition:fly={{
				x: -350,
				duration: 300,
				opacity: 1
			}}
		>
			<button use:melt={$close} aria-label="Close" class="close">
				<X size="32" />
			</button>

			<p use:melt={$description} class="description">Check out your latest updates.</p>
		</div>

		<slot />
	{/if}
</div>
