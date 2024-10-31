<script lang="ts">
	import EyeNone from '$lib/icons/RadixIconsEyeNone.svelte';
	import ArrowDown from '$lib/icons/RadixIconsArrowDown.svelte';
	import ArrowUp from '$lib/icons/RadixIconsArrowUp.svelte';
	import CaretSort from '$lib/icons/RadixIconsCaretSort.svelte';
	import type { TableViewModel } from 'svelte-headless-table';
	import type { ProductSchema } from '$lib/types/zod.js';
	import { cn } from '$lib/utils.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import type { FlattenedProduct } from '../+page.server.js';
	let className: string | undefined | null = undefined;
	export { className as class };
	export let props: {
		select: never;
		sort: {
			order: 'desc' | 'asc' | undefined;
			toggle: (_: Event) => void;
			clear: () => void;
			disabled: boolean;
		};
		filter: never;
	};
	export let tableModel: TableViewModel<FlattenedProduct>;
	export let cellId: string;

	const { hiddenColumnIds } = tableModel.pluginStates.hide;

	function handleAscSort(e: Event) {
		if (props.sort.order === 'asc') {
			return;
		}
		props.sort.toggle(e);
	}

	function handleDescSort(e: Event) {
		if (props.sort.order === 'desc') {
			return;
		}
		if (props.sort.order === undefined) {
			// We can only toggle, so we toggle from undefined to 'asc' first
			props.sort.toggle(e);
		}
		props.sort.toggle(e); // Then we toggle from 'asc' to 'desc'
	}

	function handleHide() {
		hiddenColumnIds.update((ids: string[]) => {
			if (ids.includes(cellId)) {
				return ids;
			}
			return [...ids, cellId];
		});
	}
</script>

{#if !props.sort.disabled}
	<div class={cn('flex justify-center', className)}>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger class={buttonVariants({ variant: 'ghost' })}>
				<slot />
				{#if props.sort.order === 'desc'}
					<ArrowDown class="ml-2 h-4 w-4" />
				{:else if props.sort.order === 'asc'}
					<ArrowUp class="ml-2 h-4 w-4" />
				{:else}
					<CaretSort class="ml-2 h-4 w-4" />
				{/if}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="start">
				<DropdownMenu.Item onclick={handleAscSort}>
					<ArrowUp class="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
					Asc
				</DropdownMenu.Item>
				<DropdownMenu.Item onclick={handleDescSort}>
					<ArrowDown class="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
					Desc
				</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<DropdownMenu.Item onclick={handleHide}>
					<EyeNone class="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
					Hide
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
{:else}
	<slot />
{/if}
