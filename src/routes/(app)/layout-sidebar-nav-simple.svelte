<script lang="ts">
	import type { Component } from 'svelte';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	let {
		data
	}: {
		data: {
			title: string;
			url: string;
			icon: Component;
			isActive?: boolean;
			items?: {
				title: string;
				url: string;
				isActive?: boolean;
				icon?: Component;
			}[];
		}[];
	} = $props();
</script>

{#each data as group (group.title)}
	<Sidebar.Group>
		<Sidebar.GroupLabel>{group.title}</Sidebar.GroupLabel>
		<Sidebar.GroupContent>
			<Sidebar.Menu>
				{#if group.items}
					{#each group.items as item (item.title)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton isActive={item.isActive}>
								{#snippet child({ props })}
									{#if item.icon}
										<item.icon />
									{/if}
									<a href={item.url} {...props}>
										<span>{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				{/if}
			</Sidebar.Menu>
		</Sidebar.GroupContent>
	</Sidebar.Group>
{/each}
