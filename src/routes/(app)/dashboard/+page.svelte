<script lang="ts">
	import { Tabs, TabsContent } from '$lib/components/tabs';
	import type { PageData } from './$types';

	export let data: PageData;
	let { session, profile } = data;
	$: ({ session, profile } = data);
</script>

{#if session}
	<pre>{JSON.stringify(session, null, 2)}</pre>
{/if}
<pre>{JSON.stringify(profile, null, 2)}</pre>

Dashboard

<Tabs tabs={['Styled', 'Headless', 'Extra']}>
	<TabsContent key="Styled">Hello</TabsContent></Tabs
>
