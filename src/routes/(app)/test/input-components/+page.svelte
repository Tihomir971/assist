<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import {
		MyCombobox,
		MyComboboxMelt,
		MyComboboxZag,
		MyCurrencyInput,
		MyDateInput,
		MyFileInput,
		MyNumberInput,
		MyTextInput,
		MyUrlInput
	} from '$lib/components/my/input';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	// Note: The tab IDs here ('tab1', 'tab2') must match the snippet names below
	// Sample data for testing
	let textValue = $state('Sample text');
	let numberValue = $state(42.5);
	let dateValue = $state(new Date());
	let urlValue = $state('https://example.com');
	let currencyValue = $state(1250.75);

	// Combobox data
	type Fruit = { id: number; label: string };
	let selectedFruitId = $state<number | null>(null);
	let selectedFruitIdZag = $state<number | null>(null);
	const fruits = [
		{ value: 1, label: 'Apple' },
		{ value: 2, label: 'Banana' },
		{ value: 3, label: 'Orange' },
		{ value: 4, label: 'Strawberry' },
		{ value: 5, label: 'Blueberry' },
		{ value: 6, label: 'Mango' },
		{ value: 7, label: 'Pineapple' },
		{ value: 8, label: 'Watermelon' },
		{ value: 9, label: 'Peach' },
		{ value: 10, label: 'Grapes' },
		{ value: 11, label: 'Kiwi' },
		{ value: 12, label: 'Papaya' },
		{ value: 13, label: 'Cherry' },
		{ value: 14, label: 'Pear' },
		{ value: 15, label: 'Plum' },
		{ value: 16, label: 'Apricot' },
		{ value: 17, label: 'Avocado' },
		{ value: 18, label: 'Coconut' },
		{ value: 19, label: 'Fig' },
		{ value: 20, label: 'Date' }
	];

	// Error state examples
	let textError = $state('');
	let numberError = $state('');

	// Toggle error for demonstration
	function toggleTextError() {
		textError = textError ? '' : 'This is a sample error message';
	}

	function toggleNumberError() {
		numberError = numberError ? '' : 'Please enter a valid number';
	}

	// Log values on mount to verify initial state
	onMount(() => {
		console.log('Initial values:', {
			textValue,
			numberValue,
			dateValue,
			urlValue,
			currencyValue,
			selectedFruitId
		});
	});

	// Log combobox value changes
	$effect(() => {
		console.log('Selected fruit ID changed:', selectedFruitId);
	});

	$effect(() => {
		console.log('Selected fruit ID (Zag) changed:', selectedFruitIdZag);
	});

	// Log value changes
	$effect(() => {
		console.log('Text value changed:', textValue);
	});

	$effect(() => {
		console.log('Number value changed:', numberValue);
	});

	$effect(() => {
		console.log('Date value changed:', dateValue);
	});

	$effect(() => {
		console.log('URL value changed:', urlValue);
	});

	$effect(() => {
		console.log('Currency value changed:', currencyValue);
	});
</script>

<div class="container mx-auto overflow-auto p-4">
	<h1 class="mb-6 text-2xl font-bold">Input Components Demo</h1>

	<div
		class="grid grid-cols-3 gap-6 *:grid *:gap-2 *:rounded-md *:border *:border-surface-2 *:bg-surface-1 *:p-4 *:shadow-3"
	>
		<div>
			<div>Melt Combobox</div>
			<MyComboboxMelt />
		</div>
		<!-- Bits-UI Combobox Input -->
		<div>
			<MyCombobox
				bind:value={selectedFruitId}
				items={fruits}
				placeholder="Select a fruit..."
				labelText="Bits-UI Combobox"
				inline
			/>
			<div class="flex gap-2">
				<Button
					variant="default"
					onclick={() => {
						selectedFruitId = fruits[0].value;
					}}
				>
					Select Apple
				</Button>
				<Button
					variant="destructive"
					onclick={() => {
						selectedFruitId = null;
					}}
				>
					Clear
				</Button>
			</div>
			<div>
				Current value: {selectedFruitId !== null
					? fruits.find((f) => f.value === selectedFruitId)?.label || 'None'
					: 'None'}
			</div>
		</div>

		<!-- Zag Combobox Input (Legacy) -->
		<div class="card rounded-md border p-4">
			<MyComboboxZag
				bind:value={selectedFruitIdZag}
				items={fruits}
				placeholder="Select a fruit..."
				labelText="Zag Combobox"
				inline
			/>
			<div class="flex gap-2">
				<Button
					onclick={() => {
						selectedFruitIdZag = fruits[0].value;
					}}
				>
					Select Apple
				</Button>
				<Button
					variant="destructive"
					onclick={() => {
						selectedFruitIdZag = null;
					}}
				>
					Clear
				</Button>
			</div>
			<div>
				Current value: {selectedFruitIdZag !== null
					? fruits.find((f) => f.value === selectedFruitIdZag)?.label || 'None'
					: 'None'}
			</div>
		</div>

		<!-- Text Input -->
		<div class="card rounded-md border p-4">
			<div class="mb-2">
				<MyTextInput
					bind:value={textValue}
					placeholder="Enter text..."
					error={textError}
					labelText="Text Input"
					inline
				/>
			</div>
			<div class="flex gap-2">
				<Button
					variant="default"
					onclick={() => {
						textValue = 'Reset text';
					}}
				>
					Reset
				</Button>
				<Button variant="destructive" onclick={toggleTextError}>Toggle Error</Button>
			</div>
			<div>Current value: {textValue}</div>
		</div>

		<!-- Number Input -->
		<div>
			<MyNumberInput
				bind:value={numberValue}
				min={0}
				max={10000}
				step={0.5}
				error={numberError}
				labelText="Number Input"
			/>
			<div class="mt-2 text-sm text-muted-foreground">
				Note: Step value of 0.5 automatically sets precision to 1 decimal place and
				increments/decrements by 0.5
			</div>
			<div class="flex gap-2">
				<Button
					variant="default"
					onclick={() => {
						numberValue = 50;
					}}
				>
					Reset
				</Button>
				<Button variant="destructive" onclick={toggleNumberError}>Toggle Error</Button>
			</div>
			<div>Current value: {numberValue}</div>
		</div>

		<!-- Date Input -->
		<div class="card rounded-md border p-4">
			<MyDateInput
				bind:value={dateValue}
				locale="sr-Latn-RS"
				format="dd.MM.yyyy"
				labelText="Date Input"
			/>
			<div class="flex gap-2">
				<Button
					variant="default"
					onclick={() => {
						dateValue = new Date();
					}}
				>
					Today
				</Button>
			</div>
			<div>
				Current value: {dateValue instanceof Date ? dateValue.toISOString() : dateValue}
			</div>
		</div>

		<!-- URL Input -->
		<div>
			<MyUrlInput bind:value={urlValue} placeholder="Enter URL..." labelText="URL Input" />
			<div class="flex gap-2">
				<Button
					variant="outline"
					onclick={() => {
						urlValue = 'https://svelte.dev';
					}}
				>
					Svelte
				</Button>
				<Button
					variant="outline"
					onclick={() => {
						urlValue = 'github.com';
					}}
				>
					GitHub (no protocol)
				</Button>
			</div>
			<div>Current value: {urlValue}</div>
		</div>

		<!-- File Input -->
		<div>
			<MyFileInput accept="image/*" labelText="File Input" />
			<div class="text-sm text-muted-foreground">
				Note: File input doesn't use two-way binding as it's controlled by the browser.
			</div>
		</div>

		<!-- Currency Input -->
		<div>
			<MyCurrencyInput bind:value={currencyValue} currency="RSD" labelText="Currency Input" />
			<div class="mt-2 text-sm text-muted-foreground">
				Note: Default step value of 0.01 automatically sets precision to 2 decimal places and
				increments/decrements by 0.01
			</div>
			<div class="flex gap-2">
				<Button
					variant="default"
					onclick={() => {
						currencyValue = 1000;
					}}
				>
					1000
				</Button>
				<Button
					variant="destructive"
					onclick={() => {
						currencyValue = 9999.99;
					}}
				>
					9999.99
				</Button>
			</div>
			<div>Current value: {currencyValue}</div>
		</div>

		<div class="bg-transparent">
			<Tabs.Root value="account" class="w-[400px]">
				<Tabs.List class="grid w-full grid-cols-2">
					<Tabs.Trigger value="account">Account</Tabs.Trigger>
					<Tabs.Trigger value="password">Password</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="account">
					<Card.Root>
						<Card.Header>
							<Card.Title>Account</Card.Title>
							<Card.Description>
								Make changes to your account here. Click save when you're done.
							</Card.Description>
						</Card.Header>
						<Card.Content class="space-y-2">
							<div class="space-y-1">
								<Label for="name">Name</Label>
								<Input id="name" value="Pedro Duarte" />
							</div>
							<div class="space-y-1">
								<Label for="username">Username</Label>
								<Input id="username" value="@peduarte" />
							</div>
						</Card.Content>
						<Card.Footer>
							<Button>Save changes</Button>
						</Card.Footer>
					</Card.Root>
				</Tabs.Content>
				<Tabs.Content value="password">
					<Card.Root>
						<Card.Header>
							<Card.Title>Password</Card.Title>
							<Card.Description>
								Change your password here. After saving, you'll be logged out.
							</Card.Description>
						</Card.Header>
						<Card.Content class="space-y-2">
							<div class="space-y-1">
								<Label for="current">Current password</Label>
								<Input id="current" type="password" />
							</div>
							<div class="space-y-1">
								<Label for="new">New password</Label>
								<Input id="new" type="password" />
							</div>
						</Card.Content>
						<Card.Footer>
							<Button>Save password</Button>
						</Card.Footer>
					</Card.Root>
				</Tabs.Content>
			</Tabs.Root>
		</div>
	</div>
</div>
