<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	let { session, profile } = data;
	$: ({ session, profile } = data);
</script>

{#await session}
	<pre>{JSON.stringify(session, null, 2)}</pre>
{/await}
<pre>{JSON.stringify(profile, null, 2)}</pre>

Dashboard
