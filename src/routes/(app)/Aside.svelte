<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import PhLayout from 'phosphor-svelte/lib/Layout';
	import PhRepeat from 'phosphor-svelte/lib/Repeat';
	import PhTag from 'phosphor-svelte/lib/Tag';
	import PhMicrosoftExcelLogo from 'phosphor-svelte/lib/MicrosoftExcelLogo';
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
					href="/catalog"
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
					href="/data"
					variant="ghost"
					size="icon"
					class={`[&_svg]:size-6 ${activePath === '/data' ? '' : 'text-muted-foreground'}`}
				>
					<PhRepeat />
					<span class="sr-only">Export Import</span>
				</Button>
			</Tooltip.Trigger>
			<Tooltip.Content side="right">Export Import</Tooltip.Content>
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
</nav>
