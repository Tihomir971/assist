<script lang="ts">
	import PhDotsThree from '$lib/icons/PhDotsThree.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { goto } from '$app/navigation';
	import type { FlattenedProduct } from '../+page.server.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	export let row: FlattenedProduct;
</script>

{#if row && row.id}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			<Button class={buttonVariants({ variant: 'outline' })}>
				<PhDotsThree class="h-4 w-4" />
				<span class="sr-only">Open Menu</span>
			</Button>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content class="w-[160px]" align="end">
			<DropdownMenu.Item
				onclick={() => {
					goto(`/catalog/products/${row.id.toString()}`);
				}}>Edit</DropdownMenu.Item
			>
			<DropdownMenu.Item>Favorite</DropdownMenu.Item>
			<DropdownMenu.Separator />
			<DropdownMenu.Item>
				Delete
				<DropdownMenu.Shortcut>⌘⌫</DropdownMenu.Shortcut>
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{:else}
	<div>No row data available</div>
{/if}

<!-- <Drawer.Root>
	<Drawer.Trigger>
		<Button variant="ghost">Open Drawer</Button>
	</Drawer.Trigger>
	<Drawer.Content>It me</Drawer.Content>
</Drawer.Root> -->
