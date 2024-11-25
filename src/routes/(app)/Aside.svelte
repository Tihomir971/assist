<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import PhLayout from '$lib/icons/PhLayout.svelte';
	import PhRepeat from '$lib/icons/PhRepeat.svelte';
	import PhTag from '$lib/icons/PhTag.svelte';
	import PhMicrosoftExcelLogo from '$lib/icons/PhMicrosoftExcelLogo.svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	let activePath: string | undefined = $derived(browser ? $page.url.pathname : undefined);
</script>

<nav class="bg-well-2 flex h-full flex-col items-center gap-4 border-x px-2 sm:py-5">
	<Tooltip.Provider>
		<Tooltip.Root>
			<Tooltip.Trigger>
				<Button
					href="/dashboard"
					variant="ghost"
					size="icon"
					class={`${activePath === '/dashboard' ? 'text-accent-foreground' : 'text-muted-foreground'} `}
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
				<a
					href="/catalog"
					class={`${activePath === '/catalog' ? 'text-accent-foreground' : 'text-muted-foreground'} hover:text-foreground flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8`}
				>
					<PhTag class="size-6" />
					<span class="sr-only">Catalog</span>
				</a>
			</Tooltip.Trigger>
			<Tooltip.Content side="right">Catalog</Tooltip.Content>
		</Tooltip.Root>
	</Tooltip.Provider>
	<Tooltip.Provider>
		<Tooltip.Root>
			<Tooltip.Trigger>
				<a
					href="/data"
					class={`${activePath === '/data' ? 'text-accent-foreground' : 'text-muted-foreground'} hover:text-foreground flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8`}
				>
					<PhRepeat class="size-6" />
					<span class="sr-only">Export Import</span>
				</a>
			</Tooltip.Trigger>
			<Tooltip.Content side="right">Export Import</Tooltip.Content>
		</Tooltip.Root>
	</Tooltip.Provider>
	<Tooltip.Provider>
		<Tooltip.Root>
			<Tooltip.Trigger>
				<a
					href="/excel"
					class={`${activePath === '/excel' ? 'text-accent-foreground' : 'text-muted-foreground'} hover:text-foreground flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8`}
				>
					<PhMicrosoftExcelLogo class="size-6" />
					<span class="sr-only">Import Excel</span>
				</a>
			</Tooltip.Trigger>
			<Tooltip.Content side="right">Import Excel</Tooltip.Content>
		</Tooltip.Root>
	</Tooltip.Provider>
</nav>
