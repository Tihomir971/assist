<script lang="ts">
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { Tables } from '$lib/types/supabase.types';

	import SheetChannel from './sheet-channel.svelte';
	import PhDotsThreeBold from '~icons/ph/dots-three-bold.js';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { cChannelMapCategoryInsertSchema } from '$lib/types/supabase.zod.schemas';
	import z from 'zod';

	type Schema = z.infer<typeof cChannelMapCategoryInsertSchema>;
	type Props = {
		parentId: number | undefined;
		items: Tables<'c_channel_map_category'>[];
		validatedForm: SuperValidated<Schema>;
		channels: { value: number; label: string }[];
	};
	let { parentId = $bindable(), items, validatedForm, channels }: Props = $props();

	let isSheetOpen = $state(false);
	let selectedItemId: number | undefined = $state();
	let selectedItem = $derived.by(() => {
		return items?.find((v) => v.id === selectedItemId);
	});

	const getChannelName = (value: number) => {
		if (channels) {
			return channels?.find((c) => c.value === value)?.label;
		}
		return '';
	};
</script>

<Card.Root class="col-span-2">
	<Card.Header>
		<div class="flex items-center justify-between">
			<Card.Title>Channels</Card.Title>
			<Button
				variant="link"
				onclick={() => {
					selectedItemId = undefined;
					isSheetOpen = !isSheetOpen;
				}}
			>
				Add
			</Button>
		</div>
	</Card.Header>
	<Card.Content>
		<Table.Root>
			<Table.Caption>A list of your recent invoices.</Table.Caption>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-[100px]">Channel</Table.Head>
					<Table.Head>Resource ID</Table.Head>
					<Table.Head>Description</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each items as row (row.id)}
					<Table.Row>
						<Table.Cell class="font-medium">{getChannelName(row.c_channel_id)}</Table.Cell>
						<Table.Cell>{row.resource_id}</Table.Cell>
						<Table.Cell>{row.resource_name}</Table.Cell>
						<Table.Cell>
							<Button
								variant="ghost"
								size="icon"
								onclick={() => {
									selectedItemId = row.id;
									isSheetOpen = !isSheetOpen;
								}}
							>
								<PhDotsThreeBold />
							</Button>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</Card.Content>
</Card.Root>

<SheetChannel
	bind:isSheetOpen
	bind:data={selectedItem}
	{validatedForm}
	{channels}
	categoryId={parentId}
/>
