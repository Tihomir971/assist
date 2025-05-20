<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	const version = import.meta.env.PACKAGE_VERSION;
	import PhLayout from '~icons/ph/layout';
	import PhTag from '~icons/ph/tag';
	import PhMicrosoftExcelLogo from '~icons/ph/microsoft-excel-logo';
	import PhMegaphone from '~icons/ph/megaphone';
	import PhSquaresFour from '~icons/ph/squares-four';
	import PhList from '~icons/ph/list';
	import PhFolders from '~icons/ph/folders';
	import { Button } from '$lib/components/ui/button/index.js';

	let activePath: string | undefined = $derived(browser ? page.url.pathname : undefined);

	// Check if any product-attributes route is active
	let isProductAttributesActive: boolean = $derived(
		browser && activePath ? activePath.startsWith('/catalog/product-attributes') : false
	);

	let catalogHref: string = $derived(
		(() => {
			if (!browser) return '/catalog';
			const params = new URLSearchParams(page.url.search);
			params.delete('cat');
			params.delete('sub');
			const searchParams = params.toString();
			return `/catalog${searchParams ? `?${searchParams}` : ''}`;
		})()
	);
</script>

<nav
	class="flex h-full flex-col items-center gap-4 border-r border-surface-1 bg-well-1 px-2 sm:py-5"
>
	<Tooltip.Provider>
		<Tooltip.Root>
			<Tooltip.Trigger>
				<Button
					href="/dashboard"
					variant="ghost"
					size="icon"
					class={`${activePath === '/dashboard' ? '' : 'text-muted-foreground'}`}
				>
					<PhLayout class="size-6" />
					<span class="sr-only">Dashboard</span>
				</Button>
			</Tooltip.Trigger>
			<Tooltip.Content side="right">Dashboard</Tooltip.Content>
		</Tooltip.Root>
	</Tooltip.Provider>

	<Tooltip.Provider>
		<Tooltip.Root>
			<Tooltip.Trigger>
				<Button
					href={catalogHref}
					variant="ghost"
					size="icon"
					class={`${activePath === '/catalog' ? '' : 'text-muted-foreground'}`}
				>
					<PhTag class="size-6" />
					<span class="sr-only">Catalog</span>
				</Button>
			</Tooltip.Trigger>
			<Tooltip.Content side="right">Catalog</Tooltip.Content>
		</Tooltip.Root>
	</Tooltip.Provider>

	<Tooltip.Provider>
		<Tooltip.Root>
			<Tooltip.Trigger>
				<DropdownMenu.DropdownMenu>
					<DropdownMenu.DropdownMenuTrigger>
						<Button
							variant="ghost"
							size="icon"
							class={`${isProductAttributesActive ? '' : 'text-muted-foreground'}`}
						>
							<PhSquaresFour class="size-6" />
							<span class="sr-only">Product Attributes</span>
						</Button>
					</DropdownMenu.DropdownMenuTrigger>
					<DropdownMenu.DropdownMenuContent side="right">
						<DropdownMenu.DropdownMenuItem>
							<a href="/catalog/product-attributes/attributes" class="flex w-full items-center">
								<PhTag class="mr-2 size-4" />
								<span>Attributes</span>
							</a>
						</DropdownMenu.DropdownMenuItem>
						<DropdownMenu.DropdownMenuItem>
							<a
								href="/catalog/product-attributes/attribute-groups"
								class="flex w-full items-center"
							>
								<PhList class="mr-2 size-4" />
								<span>Attribute Groups</span>
							</a>
						</DropdownMenu.DropdownMenuItem>
						<DropdownMenu.DropdownMenuItem>
							<a href="/catalog/product-attributes/attribute-sets" class="flex w-full items-center">
								<PhFolders class="mr-2 size-4" />
								<span>Attribute Sets</span>
							</a>
						</DropdownMenu.DropdownMenuItem>
					</DropdownMenu.DropdownMenuContent>
				</DropdownMenu.DropdownMenu>
			</Tooltip.Trigger>
			<Tooltip.Content side="right">Product Attributes</Tooltip.Content>
		</Tooltip.Root>
	</Tooltip.Provider>

	<Tooltip.Provider>
		<Tooltip.Root>
			<Tooltip.Trigger>
				<Button
					href="/excel"
					variant="ghost"
					size="icon"
					class={`${activePath === '/excel' ? '' : 'text-muted-foreground'}`}
				>
					<PhMicrosoftExcelLogo class="size-6" />
					<span class="sr-only">Import Excel</span>
				</Button>
			</Tooltip.Trigger>
			<Tooltip.Content side="right">Import Excel</Tooltip.Content>
		</Tooltip.Root>
	</Tooltip.Provider>
	<Tooltip.Provider>
		<Tooltip.Root>
			<Tooltip.Trigger>
				<Button
					href="/excel"
					variant="ghost"
					size="icon"
					class={`${activePath === '/excel' ? '' : 'text-muted-foreground'}`}
				>
					<PhMegaphone class="size-6" />
					<span class="sr-only">Import Excel</span>
				</Button>
			</Tooltip.Trigger>
			<Tooltip.Content side="right">Import Excel</Tooltip.Content>
		</Tooltip.Root>
	</Tooltip.Provider>
	<div class="mt-auto px-2 pb-2 text-center text-xs text-muted-foreground">v{version}</div>
</nav>
