<script lang="ts" module>
	import PhLayout from '~icons/ph/layout';
	import PhTag from '~icons/ph/tag';
	import PhMicrosoftExcelLogo from '~icons/ph/microsoft-excel-logo';
	import PhSquaresFour from '~icons/ph/squares-four';
	import PhFlask from '~icons/ph/flask';
	const items = [
		{
			title: 'Dashboard',
			url: '/dashboard',
			icon: PhLayout
		},
		{
			title: 'Catalog',
			url: '/catalog',
			icon: PhTag
		},
		{
			title: 'Product Attributes',
			url: '#',
			icon: PhSquaresFour
		},
		{
			title: 'Import Excel',
			url: '/excel',
			icon: PhMicrosoftExcelLogo
		},
		{
			title: 'Laboratory',
			url: '/lab',
			icon: PhFlask
		}
	];
</script>

<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	import PhList from '~icons/ph/list';
	import PhFolders from '~icons/ph/folders';
	import type { ComponentProps } from 'svelte';

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root class="top-(--header-height) h-[calc(100svh-var(--header-height))]!" {...restProps}>
	<Sidebar.Header>Header</Sidebar.Header>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Application</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each items as item (item.title)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton>
								{#snippet child({ props })}
									<a href={item.url} {...props}>
										<item.icon />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
</Sidebar.Root>
