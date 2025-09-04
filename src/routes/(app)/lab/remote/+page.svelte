<script lang="ts">
	import type { PageProps } from './$types';
	import { getPost } from './data.remote';

	let counter: number = $state(1);
	let errorMessage: string | null = $state(null);

	async function callRemoteFunction() {
		try {
			errorMessage = null;
			console.log('Calling remote function with:', counter);

			// Let's debug what getPost actually is
			console.log('getPost function:', getPost);
			console.log('getPost.toString():', getPost.toString());

			const result = await getPost(counter);
			console.log('Remote function result:', result);
			counter = result.value;
		} catch (error) {
			console.error('Error calling remote function:', error);
			console.error('Error details:', error);
			errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

			// Let's also check if it's a Response object
			if (error instanceof Response) {
				console.error('Response status:', error.status);
				console.error('Response headers:', Object.fromEntries(error.headers));
				error.text().then((text) => console.error('Response body:', text));
			}
		}
	}
</script>

<div class="p-4">
	<button onclick={callRemoteFunction} class="rounded bg-amber-600 p-2 text-white"
		>Call Remote Function - Counter: {counter}</button
	>

	{#if errorMessage}
		<div class="mt-4 rounded bg-red-100 p-2 text-red-800">
			Error: {errorMessage}
		</div>
	{/if}
</div>
