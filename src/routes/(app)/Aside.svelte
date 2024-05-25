<script lang="ts">
	import Package2 from 'lucide-svelte/icons/package-2';
	import Home from 'lucide-svelte/icons/home';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import PhLayout from '$lib/icons/PhLayout.svelte';
	import PhRepeat from '$lib/icons/PhRepeat.svelte';
	import PhTag from '$lib/icons/PhTag.svelte';
	import PhTestTube from '$lib/icons/PhTestTube.svelte';

	let activePath: string | undefined = undefined;
	$: if (browser) activePath = $page.url.pathname;
</script>

<nav class="flex h-full flex-col items-center gap-4 bg-muted/80 px-2 sm:py-5">
	<a
		href="##"
		class="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
	>
		<Package2 class="h-4 w-4 transition-all group-hover:scale-110" />
		<span class="sr-only">Acme Inc</span>
	</a>

	<Tooltip.Root>
		<Tooltip.Trigger asChild let:builder>
			<a
				href="/dashboard"
				class={`${activePath === '/dashboard' ? 'text-accent-foreground' : 'text-muted-foreground'} flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8`}
				use:builder.action
				{...builder}
			>
				<PhLayout class="size-6" />
				<!-- <Home class="h-5 w-5" /> -->
				<span class="sr-only">Dashboard</span>
			</a>
		</Tooltip.Trigger>
		<Tooltip.Content side="right">Dashboard</Tooltip.Content>
	</Tooltip.Root>
	<Tooltip.Root>
		<Tooltip.Trigger asChild let:builder>
			<a
				href="/catalog"
				class={`${activePath === '/catalog' ? 'text-accent-foreground' : 'text-muted-foreground'} flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8`}
				use:builder.action
				{...builder}
			>
				<PhTag class="size-6" />
				<!-- <Home class="h-5 w-5" /> -->
				<span class="sr-only">Catalog</span>
			</a>
		</Tooltip.Trigger>
		<Tooltip.Content side="right">Catalog</Tooltip.Content>
	</Tooltip.Root>
	<!-- 		<div class="tooltip tooltip-right" data-tip="Catalog">
			<a
				href="/catalog"
				data-tip="Catalog"
				class="btn btn-square btn-ghost join-item"
				class:btn-active={activePath === '/catalog'}
			>
				<PhTag class="w-6" />
			</a>
		</div> -->
	<Tooltip.Root>
		<Tooltip.Trigger asChild let:builder>
			<a
				href="/catalog/replenish"
				class={`${activePath === '/catalog/replenish' ? 'text-accent-foreground' : 'text-muted-foreground'} flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8`}
				use:builder.action
				{...builder}
			>
				<PhRepeat class="size-6" />
				<!-- <Home class="h-5 w-5" /> -->
				<span class="sr-only">Replenish</span>
			</a>
		</Tooltip.Trigger>
		<Tooltip.Content side="right">Replenish</Tooltip.Content>
	</Tooltip.Root>
	<Tooltip.Root>
		<Tooltip.Trigger asChild let:builder>
			<a
				href="/catalog/test-table"
				class={`${activePath === '/catalog/test-table' ? 'text-accent-foreground' : 'text-muted-foreground'} flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8`}
				use:builder.action
				{...builder}
			>
				<PhRepeat class="size-6" />
				<!-- <Home class="h-5 w-5" /> -->
				<span class="sr-only">Test Table</span>
			</a>
		</Tooltip.Trigger>
		<Tooltip.Content side="right">Test Table</Tooltip.Content>
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
