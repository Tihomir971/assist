<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	const version = import.meta.env.PACKAGE_VERSION;
	import PhLayout from '~icons/ph/layout';
	import PhTag from '~icons/ph/tag';
	import PhMicrosoftExcelLogo from '~icons/ph/microsoft-excel-logo';
	import { Button } from '$lib/components/ui/button/index.js';

	let activePath: string | undefined = $derived(browser ? page.url.pathname : undefined);

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

<nav class="flex h-full flex-col items-center gap-4 px-2 sm:py-5">
	<Tooltip.Provider>
		<Tooltip.Root>
			<Tooltip.Trigger>
				<Button
					href="/dashboard"
					variant="ghost"
					size="icon"
					class={`[&_svg]:size-6 ${activePath === '/dashboard' ? '' : 'text-muted-foreground'}`}
				>
					<PhLayout />
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
					class={`[&_svg]:size-6 ${activePath === '/catalog' ? '' : 'text-muted-foreground'}`}
				>
					<PhTag />
					<span class="sr-only">Catalog</span>
				</Button>
			</Tooltip.Trigger>
			<Tooltip.Content side="right">Catalog</Tooltip.Content>
		</Tooltip.Root>
	</Tooltip.Provider>

	<Tooltip.Provider>
		<Tooltip.Root>
			<Tooltip.Trigger>
				<Button
					href="/excel"
					variant="ghost"
					size="icon"
					class={`[&_svg]:size-6 ${activePath === '/excel' ? '' : 'text-muted-foreground'}`}
				>
					<PhMicrosoftExcelLogo />
					<span class="sr-only">Import Excel</span>
				</Button>
			</Tooltip.Trigger>
			<Tooltip.Content side="right">Import Excel</Tooltip.Content>
		</Tooltip.Root>
	</Tooltip.Provider>
	<div class="mt-auto px-2 pb-2 text-center text-xs text-muted-foreground">v{version}</div>
</nav>
