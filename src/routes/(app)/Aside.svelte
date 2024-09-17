<script lang="ts">
	import Package2 from 'lucide-svelte/icons/package-2';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import PhLayout from '$lib/icons/PhLayout.svelte';
	import PhRepeat from '$lib/icons/PhRepeat.svelte';
	import PhTag from '$lib/icons/PhTag.svelte';
	import PhMicrosoftExcelLogo from '$lib/icons/PhMicrosoftExcelLogo.svelte';

	let activePath: string | undefined = undefined;
	$: if (browser) activePath = $page.url.pathname;
</script>

<nav class="flex h-full flex-col items-center gap-4 border-x bg-well-2 px-2 sm:py-5">
	<Tooltip.Root>
		<Tooltip.Trigger asChild let:builder>
			<a
				href="/dashboard"
				class={`${activePath === '/dashboard' ? 'text-accent-foreground' : 'text-muted-foreground'} flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8`}
				use:builder.action
				{...builder}
			>
				<PhLayout class="size-6" />
				<span class="sr-only">Dashboard</span>
			</a>
		</Tooltip.Trigger>
		<Tooltip.Content side="right">Dashboard</Tooltip.Content>
	</Tooltip.Root>
	<!-- 	<Tooltip.Root>
		<Tooltip.Trigger asChild let:builder>
			<a
				href="/catalog"
				class={`${activePath === '/catalog' ? 'text-accent-foreground' : 'text-muted-foreground'} flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8`}
				use:builder.action
				{...builder}
			>
				<PhTag class="size-6" />
				<span class="sr-only">Catalog</span>
			</a>
		</Tooltip.Trigger>
		<Tooltip.Content side="right">Catalog</Tooltip.Content>
	</Tooltip.Root> -->

	<Tooltip.Root>
		<Tooltip.Trigger asChild let:builder>
			<a
				href="/catalog/test-table"
				class={`${activePath === '/catalog/test-table' ? 'text-accent-foreground' : 'text-muted-foreground'} flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8`}
				use:builder.action
				{...builder}
			>
				<PhTag class="size-6" />
				<span class="sr-only">Test Table</span>
			</a>
		</Tooltip.Trigger>
		<Tooltip.Content side="right">Test Table</Tooltip.Content>
	</Tooltip.Root>
	<Tooltip.Root>
		<Tooltip.Trigger asChild let:builder>
			<a
				href="/data"
				class={`${activePath === '/data' ? 'text-accent-foreground' : 'text-muted-foreground'} flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8`}
				use:builder.action
				{...builder}
			>
				<PhRepeat class="size-6" />
				<span class="sr-only">Export Import</span>
			</a>
		</Tooltip.Trigger>
		<Tooltip.Content side="right">Export Import</Tooltip.Content>
	</Tooltip.Root>
	<Tooltip.Root>
		<Tooltip.Trigger asChild let:builder>
			<a
				href="/excel"
				class={`${activePath === '/excel' ? 'text-accent-foreground' : 'text-muted-foreground'} flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8`}
				use:builder.action
				{...builder}
			>
				<PhMicrosoftExcelLogo class="size-6" />
				<span class="sr-only">Import Excel</span>
			</a>
		</Tooltip.Trigger>
		<Tooltip.Content side="right">Import Excel</Tooltip.Content>
	</Tooltip.Root>
	<!-- 		<div class="tooltip tooltip-right" data-tip="Replenish">
			<a
				href="/catalog/replenish"
				data-tip="Replanish"
				class="btn btn-square btn-ghost join-item"
				class:btn-active={activePath === '/catalog/replenish'}
			>
				<PhRepeat class="w-6" />
			</a>
		</div> -->
	<!-- 
		<div class="dropdown dropdown-right dropdown-hover">
			<div
				tabindex="0"
				role="button"
				class="btn btn-square btn-ghost join-item"
				class:btn-active={activePath?.startsWith('/catalog/')}
			>
				<PhTestTube class="w-6" />
			</div>
			<ul class="menu dropdown-content z-[1] w-52 rounded-box bg-base-300 p-2 shadow">
				<li class="menu-title">Catalog</li>
				<li><a href="/test" class:active={activePath === '/test'}>Test</a></li>
				<li>
					<a href="/catalog/attribute" class:active={activePath === '/catalog/attribute'}
						>Attribute</a
					>
				</li>
			</ul>
		</div> -->
</nav>
