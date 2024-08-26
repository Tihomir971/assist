<script lang="ts">
	import SidebarNav from '../(components)/sidebar-nav.svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	//	export let data;
	let { data, children } = $props();
	import { Button } from '$lib/components/ui/button/index.js';
	import { enhance } from '$app/forms';

	let sidebarNavItems: { title: string; href: string }[] | undefined = $state();

	$effect(() => {
		sidebarNavItems = [
			{
				title: 'Profile',
				href: `/catalog/products/${data.productId}`
			},
			{
				title: 'Purchasing',
				href: `/catalog/products/${data.productId}/purchasing`
			},
			{
				title: 'Replenish',
				href: `/catalog/products/${data.productId}/replenish`
			}
		];
	});
</script>

<div class="container flex w-full flex-col overflow-y-auto p-3">
	{@render children()}
</div>
<!-- <div class="container my-2 grid h-full grid-rows-[auto_auto_1fr] overflow-hidden p-6">
	<div class="flex justify-between">
		<div class="space-y-0.5">
			<h2 class="text-2xl font-bold tracking-tight">Product</h2>
			<p class="text-muted-foreground">Manage your product settings.</p>
		</div>
		<form method="POST" action="/catalog?/getIdeaInfo" use:enhance>
			<input type="hidden" name="ids" value={[data.productId]} />
			<Button variant="secondary" type="submit">Info from Idea</Button>
		</form>
		<Button variant="secondary" type="button" onclick={() => history.back()}>Return</Button>
	</div>
	<Separator class="my-6" />
	<div class="flex h-full w-full overflow-hidden">
		<aside class="w-52">
			{#if sidebarNavItems !== undefined}
				<SidebarNav items={sidebarNavItems} />
			{/if}
		</aside>
		<Separator orientation="vertical" class="mx-6" />
		<div class="overflow-hiden h-full max-h-full flex-1">
			{@render children()}
		</div>
	</div>
</div> -->
