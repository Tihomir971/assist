<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import { fade, fly } from 'svelte/transition';
	import { getCtx } from '../ctx';
	import { X } from 'lucide-svelte';

	const {
		elements: { portalled, overlay, content, close, title, description },
		states: { open }
	} = getCtx();
</script>

<div class="" use:melt={$portalled}>
	{#if $open}
		<div
			use:melt={$overlay}
			class="fixed inset-0 z-50 bg-black/50"
			transition:fade={{ duration: 150 }}
		/>
		<div
			use:melt={$content}
			class="fixed right-0 top-0 z-50 h-screen w-full max-w-[350px] bg-base-100 p-4 shadow-lg focus:outline-none"
			transition:fly={{
				x: 350,
				duration: 300,
				opacity: 1
			}}
		>
			<button
				use:melt={$close}
				aria-label="Close"
				class="btn btn-circle btn-accent btn-xs absolute right-[10px] top-[10px]"
			>
				<X class="size-4" />
			</button>
			<h2 use:melt={$title} class="mb-0 text-lg font-medium">Notifications</h2>
			<p use:melt={$description} class="mb-5 mt-2 leading-normal">Check out your latest updates.</p>
			<slot />
		</div>
	{/if}
</div>
