<script lang="ts" context="module">
	export type ToastData = {
		title: string;
		description: string;
		color: string;
	};

	const {
		elements: { content, title, description, close },
		helpers,
		states: { toasts },
		actions: { portal }
	} = createToaster<ToastData>({ closeDelay: 10000 });

	export const addToast = helpers.addToast;
</script>

<script lang="ts">
	import { createToaster, melt } from '@melt-ui/svelte';
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import { X } from 'lucide-svelte';
	import { cn } from '$lib/scripts/tailwind';
</script>

<div class="toast toast-center toast-top" use:portal>
	{#each $toasts as { id, data } (id)}
		<div
			use:melt={$content(id)}
			animate:flip={{ duration: 500 }}
			in:fly={{ duration: 150, x: '100%' }}
			out:fly={{ duration: 150, x: '100%' }}
			class={cn('alert', data.color)}
			role="alert"
		>
			<article>
				<div use:melt={$title(id)}>
					<strong>{data.title}</strong>
				</div>
				<div use:melt={$description(id)}>
					{data.description}
				</div>
				<button
					use:melt={$close(id)}
					class="btn btn-circle btn-ghost btn-xs absolute right-4 top-4"
				>
					<X size="12" />
				</button>
			</article>
		</div>
	{/each}
</div>
