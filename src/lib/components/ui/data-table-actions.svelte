<script lang="ts">
	import type { CellContext } from '@tanstack/svelte-table';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import PhDotsThree from '~icons/ph/dots-three';

	interface Props {
		props: CellContext<any, unknown>;
	}

	let { props: prop }: Props = $props();
	const id = prop.row.original.id;

	function handleEdit() {
		// All table-based routes now use the /edit/{id} pattern
		goto(`${page.url.pathname}/edit/${id}`);
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="ghost" class="h-8 w-8 p-0">
				<span class="sr-only">Open menu</span>
				<PhDotsThree class="h-4 w-4" />
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		<DropdownMenu.Group>
			<DropdownMenu.Item onclick={handleEdit}>Edit</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
