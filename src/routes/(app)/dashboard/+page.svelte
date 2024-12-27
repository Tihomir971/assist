<script lang="ts">
	import { Tree } from '$lib/components/melt/tree/index.js';
	import Combobox from '$lib/components/Zag/Combobox/Combobox.svelte';
	import * as Card from '$lib/components/ui/card/index.js';

	let { data } = $props();
	let { session, profile } = $derived(data);
	interface ComboxData {
		label: string;
		value: string;
	}

	const comboboxData: ComboxData[] = [
		{ label: 'United States', value: 'US' },
		{ label: 'Germany', value: 'DE' },
		{ label: 'Japan', value: 'JP' }
	];
	let selectedCountry = $state(['US']);
</script>

{#if session}
	<!-- <pre>{JSON.stringify(session, null, 2)}</pre> -->
	<pre>{JSON.stringify(profile, null, 2)}</pre>
	<div>
		<Combobox
			data={comboboxData}
			bind:value={selectedCountry}
			label="Select Country"
			placeholder="Select..."
		/>
	</div>
{/if}

<Card.Root>
	<Card.Header>
		<Card.Title>Card Title</Card.Title>
		<Card.Description>Card Description</Card.Description>
	</Card.Header>
	<Card.Content>
		<Tree />
	</Card.Content>
	<Card.Footer>
		<p>Card Footer</p>
	</Card.Footer>
</Card.Root>
