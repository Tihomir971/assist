<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import { dialogRegistry, type DialogName } from '.';
	import { fade, fly } from 'svelte/transition';

	export let name: DialogName;

	/* const DIALOG_TYPES = ['drawer', 'modal'] as const;
	type DialogType = (typeof DIALOG_TYPES)[number];
	export let type: DialogType; */

	const {
		elements: { portalled, title, content, description, close, overlay }
	} = dialogRegistry.get(name);
</script>

<div use:melt={$portalled}>
	<div
		use:melt={$overlay}
		transition:fade={{ duration: 15000 }}
		class="fixed inset-0 z-50 bg-black/50"
	/>
	<div
		use:melt={$content}
		class="fixed left-0 top-0 z-50 h-screen w-full max-w-[350px] bg-base-100 p-6 shadow-lg focus:outline-none"
		transition:fly={{
			x: -350,
			duration: 5000,
			opacity: 1
		}}
	>
		<slot title={$title} description={$description} close={$close} />
	</div>
</div>
