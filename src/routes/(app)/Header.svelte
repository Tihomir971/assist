<script lang="ts">
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';

	import Search from 'lucide-svelte/icons/search';
	import PhList from '$lib/icons/PhList.svelte';

	import { applyAction, enhance } from '$app/forms';
	import { goto, invalidate } from '$app/navigation';
	import { Avatar } from '$lib/components/avatar';
	import type { SubmitFunction } from '@sveltejs/kit';
</script>

<header class="bg-muted flex h-full min-w-80 items-center justify-between gap-x-3 border-b">
	<!-- 	<div class="flex-1">
		<a href="/" class="btn btn-ghost text-xl">KALISI Assistant</a>
	</div>
	<div class="flex-none gap-2">
		<div class="form-control">
			<input type="search" placeholder="Search" class="input input-bordered w-24 md:w-auto" />
		</div>
		<div class="dropdown dropdown-end">
			<div tabindex="0" role="button" class="avatar btn btn-circle btn-ghost">
				<div class="w-10 rounded-full">
					<img
						alt="Tailwind CSS Navbar component"
						src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
					/>
				</div>
			</div>
			<ul class="menu dropdown-content menu-sm z-50 mt-3 w-52 rounded-box bg-base-100 p-2 shadow">
				<li>
					<a href="/account" class="justify-between">
						Profile
						<span class="badge">New</span>
					</a>
				</li>
				<li><a href="/">Settings</a></li>
				<li>
					<form action="/auth?/signout" method="post" class="p-0">
						<button type="submit" class="btn-block">Logout</button>
					</form>
				</li>
			</ul>
		</div>
	</div> -->
	<div class="grid size-12 place-items-center"><PhList class="size-8"></PhList></div>
	<div class="flex w-full items-center justify-between">
		<div>KALISI Assistant</div>
		<div class="relative ml-auto flex-1 md:grow-0">
			<Search class="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
			<Input
				type="search"
				placeholder="Search..."
				class="bg-background w-full rounded-lg pl-8 md:w-[200px] lg:w-[336px]"
			/>
		</div>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button
					variant="outline"
					size="icon"
					class="overflow-hidden rounded-full"
					builders={[builder]}
				>
					<img
						src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
						width={36}
						height={36}
						alt="Avatar"
						class="overflow-hidden rounded-full"
					/>
				</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				<DropdownMenu.Label>My Account</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<DropdownMenu.Item>Settings</DropdownMenu.Item>
				<DropdownMenu.Item>Support</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<DropdownMenu.Item on:click={() => goto('/auth?/signout')}>Logout</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
</header>
