<script lang="ts">
	import { Tabs, TabsContent } from '$lib/components/tabs';
	import { TabsList, type TabHeader, Tab } from '$lib/components/tabs2';
	import type { PageData } from './$types';

	export let data: PageData;
	let { session, profile } = data;
	$: ({ session, profile } = data);

	const tabHeaders: TabHeader[] = [
		{
			key: 'styled',
			title: 'Styled',
			icon: 'text-xl i-material-symbols-water-drop-rounded'
		},
		{
			key: 'headless',
			title: 'Headless',
			icon: 'text-xl i-material-symbols-water-drop-outline-rounded'
		},
		{ key: 'extra', title: 'Extra' }
	];
</script>

{#await session}
	<pre>{JSON.stringify(session, null, 2)}</pre>
{/await}
<pre>{JSON.stringify(profile, null, 2)}</pre>

Dashboard
<TabsList
	{tabHeaders}
	defaultTab="headless"
	disabledTabs={['extra']}
	ariaLabel="disabled tabs example"
>
	<Tab key="styled">Styled Content</Tab>
	<Tab key="headless">Headless Content</Tab>
	<Tab key="extra">Extra Content</Tab>
</TabsList>

<Tabs tabs={['Styled', 'Headless', 'Extra']}>
	<TabsContent key="Styled">Hello</TabsContent></Tabs
>
