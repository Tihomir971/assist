<script lang="ts">
	import { NumberInputDecimal, SelectArk } from '$lib/components/ark';
	import { ComboboxAsync } from '$lib/components/ark/combobox';
	import { searchUsers } from '$lib/components/ark/combobox/async.remote';
	import { searchCategories } from '$lib/remote/category.remote';
	import { Field } from '@ark-ui/svelte/field';
	import { createPost } from './data.remote';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	import * as z from 'zod';
	// Define types for better type safety
	interface User {
		id: number;
		name: string;
		email: string;
		avatar: string;
	}

	interface Fruit {
		id: number;
		name: string;
		color: string;
		category: string;
	}
	// export let data: PageData;
	let variable = $state(1325.53);

	let selectedUser = $state<User | null>(null);
	let { data } = $props();
	const items = [
		{ label: 'United States', value: 1, flag: '🇺🇸' },
		{ label: 'United Kingdom', value: 2, flag: '🇬🇧' },
		{ label: 'Canada', value: 3, flag: '🇨🇦' },
		{ label: 'Germany', value: 4, disabled: true },
		{ label: 'France', value: 5, flag: '🇫🇷' },
		{ label: 'Japan', value: 6, flag: '🇯🇵' },
		{ label: 'Australia', value: 7, flag: '🇦🇺' },
		{ label: 'Brazil', value: 8, flag: '🇧🇷' }
	];
	const searchUsersWrapper = async (query: string) => {
		// const result = await searchUsers(query);
		const result = await searchCategories(query);
		console.log('Search Result:', result);
		return result;
	};

	const searchFruits = async (query: string): Promise<Fruit[]> => {
		const fruits: Fruit[] = [
			{ id: 1, name: 'Apple', color: 'Red', category: 'Tree Fruit' },
			{ id: 2, name: 'Banana', color: 'Yellow', category: 'Tropical' },
			{ id: 3, name: 'Orange', color: 'Orange', category: 'Citrus' },
			{ id: 4, name: 'Grape', color: 'Purple', category: 'Vine Fruit' },
			{ id: 5, name: 'Strawberry', color: 'Red', category: 'Berry' },
			{ id: 6, name: 'Blueberry', color: 'Blue', category: 'Berry' },
			{ id: 7, name: 'Pineapple', color: 'Yellow', category: 'Tropical' },
			{ id: 8, name: 'Mango', color: 'Orange', category: 'Tropical' }
		];

		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 300));

		return fruits.filter(
			(fruit) =>
				fruit.name.toLowerCase().includes(query.toLowerCase()) ||
				fruit.category.toLowerCase().includes(query.toLowerCase())
		);
	};
</script>

<div class="space-y-8 p-16">
	<pre>{JSON.stringify(createPost, null, 2)}</pre>
	<form
		{...createPost}
		onfocusout={() => createPost.validate()}
		onsubmit={(e) => {
			e.preventDefault();
			const formData = new FormData(e.target as HTMLFormElement);
			for (const pair of formData.entries()) {
				console.log(pair[0], pair[1]);
			}
		}}
		class="space-y-4"
	>
		<h2>H2 {createPost.input?.title}</h2>
		<!-- <input bind:value={variable} name="title" min={0} /> -->
		<!-- <input bind:value={variable} name="content" min={0} /> -->
		<Card.Root>
			<Card.Content class="space-y-4">
				<NumberInputDecimal
					bind:value={variable}
					min={0}
					name={createPost.field('title')}
					invalid={!!createPost.issues?.title}
					label="Name"
				/>
				{#if createPost.issues?.title}
					<p>Title</p>
					{#each createPost.issues.title as issue}
						<p class="issue">{issue.message}</p>
					{/each}
				{/if}
				<hr />
				<SelectArk
					{items}
					name={createPost.field('content')}
					label="Content"
					onValueChange={(deatils) => {
						console.log('Ovos us detaais', deatils);
					}}
				/>
				{#if createPost.issues?.content}
					{#each createPost.issues.content as issue}
						<p class="issue">{issue.message}</p>
					{/each}
				{/if}
				<hr />

				<!-- <div class="flex items-center justify-between">
					<Button size="sm">Secondary</Button>
					<Button variant="secondary">Secondary</Button>
					<Button size="sm" variant="outline" class="dark:bg-background">Outline</Button>
					<Button size="sm" variant="ghost">Ghost</Button>
				</div> -->
				<button>Publish!</button>
			</Card.Content>
		</Card.Root>
	</form>
	<div class="preview">
		<h2>{createPost?.input?.title}</h2>
		<div>{@html createPost?.input?.content}</div>
	</div>

	{JSON.stringify(variable, null, 2)}
	<h1 class="text-2xl font-bold">Ark UI ComboboxAsync Examples</h1>

	<!-- Basic User Search -->
	<!-- 	<div class="space-y-2">
		<h2 class="text-lg font-semibold">User Search (Basic)</h2>
		<ComboboxAsync
			label="Search Users"
			placeholder="Type a name or email..."
			search={searchUsersWrapper}
			itemToValue={(user) => user.value.toString()}
			itemToString={(user) => user.label}
			minChars={1}
			debounceMs={200}
		/>
	</div> -->

	<!-- User Search with Custom Content -->
	<!-- 	<div class="space-y-2">
		<h2 class="text-lg font-semibold">User Search (Custom Content)</h2>
		<ComboboxAsync
			label="Search Users with Details"
			placeholder="Type a name or email..."
			search={searchUsersWrapper}
			itemToValue={(user) => user.value.toString()}
			itemToString={(user) => user.label}
		>
			{#snippet itemContent({ item })}
				<div class="flex w-full items-center justify-between">
					<div class="flex items-center space-x-3">
						<div
							class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white"
						>
							{item.avatar}
						</div>
						<div>
							<div class="font-medium text-gray-900 dark:text-gray-100">{item.name}</div>
							<div class="text-sm text-gray-500 dark:text-gray-400">{item.email}</div>
						</div>
					</div>
				</div>
			{/snippet}
		</ComboboxAsync>
	</div> -->

	<!-- Fruit Search Example -->
	<!-- <div class="space-y-2">
		<h2 class="text-lg font-semibold">Fruit Search (Custom Data)</h2>
		<ComboboxAsync
			label="Search Fruits"
			placeholder="Type a fruit name or category..."
			search={searchFruits}
			itemToValue={(fruit: Fruit) => fruit.id.toString()}
			itemToString={(fruit: Fruit) => fruit.name}
			minChars={2}
		>
			{#snippet itemContent({ item })}
				<div class="flex w-full items-center justify-between">
					<div class="flex items-center space-x-3">
						<div
							class="h-4 w-4 rounded-full"
							style="background-color: {item.color.toLowerCase()}"
						></div>
						<div>
							<div class="font-medium text-gray-900 dark:text-gray-100">{item.name}</div>
							<div class="text-sm text-gray-500 dark:text-gray-400">{item.category}</div>
						</div>
					</div>
				</div>
			{/snippet}
		</ComboboxAsync>
	</div> -->

	<!-- Configuration Examples -->
	<div class="space-y-2">
		<h2 class="text-lg font-semibold">Configuration Examples</h2>

		<!-- Fast search with no minimum characters -->
		<!-- <div class="space-y-1">
			<h3 class="text-md font-medium">Fast Search (No minimum chars)</h3>
			<Field.Root required>
				<Field.Label>Country</Field.Label>
				<ComboboxAsync
					label="Instant Search"
					placeholder="Search immediately..."
					search={searchUsersWrapper}
					itemToValue={(user) => user.value.toString()}
					itemToString={(user) => user.label}
					minChars={0}
					debounceMs={100}
				/>
				<Field.HelperText>Additional Info</Field.HelperText>
				<Field.ErrorText>Error Info</Field.ErrorText>
			</Field.Root>
		</div> -->

		<!-- Slow search with higher minimum -->
		<!-- <div class="space-y-1">
			<h3 class="text-md font-medium">Slow Search (3+ chars required)</h3>
			<ComboboxAsync
				label="Detailed Search"
				placeholder="Type at least 3 characters..."
				search={searchUsersWrapper}
				itemToValue={(x) => x.value.toString()}
				itemToString={(x) => x.label}
				minChars={3}
				debounceMs={500}
			/>
		</div> -->
	</div>

	<!-- Debug Info -->
	<!-- {#if selectedUser}
		<div class="mt-8 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
			<h3 class="mb-2 font-semibold">Selected User:</h3>
			<pre class="text-sm">{JSON.stringify(selectedUser, null, 2)}</pre>
		</div>
	{/if} -->
</div>
