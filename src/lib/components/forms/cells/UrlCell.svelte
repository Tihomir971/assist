<script lang="ts">
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import PhArrowSquareOut from '~icons/ph/arrow-square-out';
	import { Button } from '$lib/components/ui/button';

	export let value: string | undefined | null;
</script>

{#if value}
	<a href={value} target="_blank" rel="noopener noreferrer" on:click|stopPropagation>
		<Button variant="ghost" size="icon" class="h-8 w-8">
			<PhArrowSquareOut />
		</Button>
	</a>
{:else}
	<span></span>
{/if}
