<script lang="ts" module>
	import PhTag from '~icons/ph/tag';
	import PhMicrosoftExcelLogo from '~icons/ph/microsoft-excel-logo';
	import PhFlask from '~icons/ph/flask';

	const data = {
		navMain: [
			{
				title: 'Products',
				url: '/catalog',
				icon: PhTag,
				items: [
					{ title: 'Catalog', url: '/catalog' },
					{ title: 'Price lists', url: '/catalog/price-lists' },
					{ title: 'Product Brands', url: '/catalog/product-brands' },
					{
						title: 'Attributes',
						url: '/catalog/product-attributes/attributes'
					},
					{
						title: 'Attribute Groups',
						url: '/catalog/product-attributes/attribute-groups'
					},
					{
						title: 'Attribute Sets',
						url: '/catalog/product-attributes/attribute-sets'
					}
				]
			},
			{
				title: 'Sales/Purchase',
				url: '/catalog',
				icon: PhTag,
				items: [
					{ title: 'Contacts', url: '/crm/contacts' },
					{ title: 'Price Rules', url: '/crm/pricing-rules' },
					{ title: 'Generate Document', url: '/crm/generate-document' }
				]
			},
			{
				title: 'System',
				url: '/system',
				icon: PhTag,
				items: [{ title: 'Document Templates', url: '/system/doc-templates' }]
			},
			{
				title: 'Data',
				url: '#',
				icon: PhMicrosoftExcelLogo,
				items: [{ title: 'Import Pricelist', url: '/data/import-pricelist' }]
			},
			{
				title: 'Laboratory',
				url: '/lab',
				icon: PhFlask,
				items: [
					{ title: 'Ark', url: '/lab/ark' },
					{ title: 'Shadcn', url: '/lab/shadcn' },
					{ title: 'Color Palette', url: '/lab/color-palette' },
					{ title: 'Price Rules', url: '/lab/pricing-test' },
					{ title: 'tree-view', url: '/lab/treview' }
				]
			}
		]
	};
</script>

<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import SidebarNavMain from './layout-sidebar-nav-main.svelte';
	import SidebarNavUser from './layout-sidebar-nav-user.svelte';
	import type { ComponentProps } from 'svelte';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import type { Database } from '@tihomir971/assist-shared';

	let {
		ref = $bindable(null),
		profile,
		supabase,
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & {
		supabase: SupabaseClient<Database>;
		profile: {
			first_name: string | null;
			last_name: string | null;
			avatar_url: string | null;
		} | null;
	} = $props();
</script>

<div>
	<Sidebar.Root
		class="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
		collapsible="icon"
		{...restProps}
	>
		<!-- <Sidebar.Header>Header</Sidebar.Header> -->
		<Sidebar.Header>
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<Sidebar.MenuButton size="lg">
						{#snippet child({ props })}
							<a href="/dashboard" {...props}>
								<div
									class="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground"
								>
									<img src="/FluentEmojiFlatRedHeart.svg" alt="Logo" class="size-6" />
									<!-- <CommandIcon class="size-4" /> -->
								</div>
								<div class="grid flex-1 text-left text-sm leading-tight">
									<span class="truncate font-medium">Kalisi doo</span>
									<span class="truncate text-xs">Enterprise</span>
								</div>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Header>
		<Sidebar.Content>
			<SidebarNavMain items={data.navMain} />
			<!-- <LayoutSidebarNavSimple data={dataSimple.navMain} /> -->
		</Sidebar.Content>
		<Sidebar.Footer>
			<SidebarNavUser {profile} {supabase} />
		</Sidebar.Footer>
	</Sidebar.Root>
</div>
