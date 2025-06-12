<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { browser, dev } from '$app/environment';
	import { page } from '$app/state';
	const version = import.meta.env.PACKAGE_VERSION;
	import PhLayout from '~icons/ph/layout';
	import PhTag from '~icons/ph/tag';
	import PhMicrosoftExcelLogo from '~icons/ph/microsoft-excel-logo';
	import PhSquaresFour from '~icons/ph/squares-four';
	import PhList from '~icons/ph/list';
	import PhFolders from '~icons/ph/folders';
	import PhFlask from '~icons/ph/flask';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';

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

<nav class="border-surface-1 flex h-full flex-col items-center gap-4 border-r px-2 sm:py-5">
	<Tooltip.Provider>
		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<Button
						{...props}
						href="/dashboard"
						variant="ghost"
						size="icon"
						class={`${activePath === '/dashboard' ? '' : 'text-muted-foreground'}`}
					>
						<PhLayout class="size-6" />
						<span class="sr-only">Dashboard</span>
					</Button>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content side="right">Dashboard</Tooltip.Content>
		</Tooltip.Root>
	</Tooltip.Provider>

	<Tooltip.Provider>
		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<Button
						{...props}
						href={catalogHref}
						variant="ghost"
						size="icon"
						class={`${activePath === '/catalog' ? '' : 'text-muted-foreground'}`}
					>
						<PhTag class="size-6" />
						<span class="sr-only">Catalog</span>
					</Button>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content side="right">Catalog</Tooltip.Content>
		</Tooltip.Root>
	</Tooltip.Provider>

	<DropdownMenu.DropdownMenu>
		<DropdownMenu.DropdownMenuTrigger class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
			<PhSquaresFour class="size-6" />
		</DropdownMenu.DropdownMenuTrigger>
		<DropdownMenu.DropdownMenuContent side="right">
			<DropdownMenu.DropdownMenuItem>
				<a href="/catalog/product-attributes/attributes" class="flex w-full items-center">
					<PhTag class="mr-2 size-4" />
					<span>Attributes</span>
				</a>
			</DropdownMenu.DropdownMenuItem>
			<DropdownMenu.DropdownMenuItem>
				<a href="/catalog/product-attributes/attribute-groups" class="flex w-full items-center">
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

	<Tooltip.Provider>
		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<Button
						{...props}
						href="/excel"
						variant="ghost"
						size="icon"
						class={`${activePath === '/excel' ? '' : 'text-muted-foreground'}`}
					>
						<PhMicrosoftExcelLogo class="size-6" />
						<span class="sr-only">Import Excel</span>
					</Button>
				{/snippet}
			</Tooltip.Trigger>
			<Tooltip.Content side="right">Import Excel</Tooltip.Content>
		</Tooltip.Root>
	</Tooltip.Provider>
	{#if dev}
		<Tooltip.Provider>
			<Tooltip.Root>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<Button
							{...props}
							href="/lab"
							variant="ghost"
							size="icon"
							class={`${activePath === '/excel' ? '' : 'text-muted-foreground'}`}
						>
							<PhFlask class="size-6" />
							<span class="sr-only">Laboratory</span>
						</Button>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content side="right">Laboratory</Tooltip.Content>
			</Tooltip.Root>
		</Tooltip.Provider>
	{/if}
	<div class="mt-auto px-2 pb-2 text-center text-xs text-muted-foreground">v{version}</div>
</nav>
