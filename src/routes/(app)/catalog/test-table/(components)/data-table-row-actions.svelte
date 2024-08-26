<script lang="ts">
	import PhDotsThree from '$lib/icons/PhDotsThree.svelte';
	import { productSchema, type ProductSchema } from '$lib/types/zod.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { goto } from '$app/navigation';
	import * as Drawer from '$lib/components/ui/drawer/index.js';

	export let row: ProductSchema;
	const task = productSchema.parse(row);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button
			variant="ghost"
			builders={[builder]}
			class="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
		>
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
		<Drawer.Root>
			<Drawer.Trigger asChild let:builder>
				<div use:builder.action {...builder} class="px-2 py-1.5 text-sm hover:bg-[--surface-3]">
					Open Drawer
				</div>
			</Drawer.Trigger>
			<Drawer.Content>It me</Drawer.Content>
		</Drawer.Root>
		<DropdownMenu.Item>Favorite</DropdownMenu.Item>
		<DropdownMenu.Separator />

		<DropdownMenu.Item>
			Delete
			<DropdownMenu.Shortcut>⌘⌫</DropdownMenu.Shortcut>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
