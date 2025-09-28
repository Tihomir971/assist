<script module>
	export { ColumnHeader };
</script>

<script lang="ts">
	import type { Column } from '@tanstack/table-core';
	import { cn } from 'tailwind-variants';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import ArrowUpIcon from '@lucide/svelte/icons/arrow-up';
	import ArrowDownIcon from '@lucide/svelte/icons/arrow-down';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import EyeOffIcon from '@lucide/svelte/icons/eye-off';
	import type { HTMLAttributes } from 'svelte/elements';
</script>

{#snippet ColumnHeader<TData, TValue>({
	column,
	title,
	class: className,
	...restProps
}: { column: Column<TData>; title: string } & HTMLAttributes<HTMLDivElement>)}
	{#if !column?.getCanSort()}
		<div class={className} {...restProps}>
			{title}
		</div>
	{:else}
		<div class={cn('flex items-center', className)} {...restProps}>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button
							{...props}
							variant="ghost"
							size="sm"
							class="-ml-3 h-8 data-[state=open]:bg-accent"
						>
							<span>
								{title}
							</span>
							<!-- {#if column.getIsSorted() === 'desc'} -->
							{#if column.getIsSorted() === 'desc'}
								<ArrowDownIcon />
							{:else if column.getIsSorted() === 'asc'}
								<ArrowUpIcon />
							{:else}
								<ChevronsUpDownIcon />
							{/if}
						</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="start">
					<DropdownMenu.Item
						onclick={() =>
							column.getIsSorted() === 'asc' ? column.clearSorting() : column.toggleSorting(false)}
					>
						{#if column.getIsSorted() === 'asc'}
							<ChevronsUpDownIcon class="mr-2 size-3.5 text-muted-foreground/70" />
							Clear Sorting
						{:else}
							<ArrowUpIcon class="mr-2 size-3.5 text-muted-foreground/70" />
							Sort Ascending
						{/if}
					</DropdownMenu.Item>
					<DropdownMenu.Item
						onclick={() =>
							column.getIsSorted() === 'desc' ? column.clearSorting() : column.toggleSorting(true)}
					>
						{#if column.getIsSorted() === 'desc'}
							<ChevronsUpDownIcon class="mr-2 size-3.5 text-muted-foreground/70" />
							Clear Sorting
						{:else}
							<ArrowDownIcon class="mr-2 size-3.5 text-muted-foreground/70" />
							Sort Descending
						{/if}
					</DropdownMenu.Item>
					<DropdownMenu.Separator />
					<DropdownMenu.Item onclick={() => column.toggleVisibility(false)}>
						<EyeOffIcon class="mr-2 size-3.5 text-muted-foreground/70" />
						Hide
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	{/if}
{/snippet}
