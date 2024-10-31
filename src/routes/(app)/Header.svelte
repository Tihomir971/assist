<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import Search from 'lucide-svelte/icons/search';
	import ShoppingCart from './shopping-cart.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { enhance } from '$app/forms';
	import * as Avatar from '$lib/components/ui/avatar';
	import type { SupabaseClient } from '@supabase/supabase-js';

	const handleSignOut: SubmitFunction = () => {
		return async ({ update }) => {
			update();
		};
	};
	//	let signOutEl: HTMLDivElement | undefined = $state();
	let formEl: HTMLFormElement;
	export let supabase: SupabaseClient;
</script>

<header class="grid w-full grid-cols-3 border-b p-3">
	<div class="flex items-center gap-x-1.5">Bredcrumb</div>
	<div class="relative ml-auto flex-1 md:grow-0">
		<Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
		<Input
			id="searchApp"
			type="search"
			placeholder="Search..."
			class="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
		/>
	</div>
	<div class="flex items-center justify-end gap-x-3">
		<ShoppingCart {supabase} />
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				<Button variant="ghost" class="relative h-8 w-8 rounded-full">
					<Avatar.Root class="h-8 w-8">
						<Avatar.Image src="https://github.com/shadcn.png" alt="@shadcn" />
						<Avatar.Fallback>CN</Avatar.Fallback>
					</Avatar.Root>
				</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				<DropdownMenu.Label>My Account</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<DropdownMenu.Item>Settings</DropdownMenu.Item>
				<DropdownMenu.Item>Support</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<form method="post" action="/?/signout" use:enhance={handleSignOut} bind:this={formEl}>
					<DropdownMenu.Item
						onclick={() => {
							formEl.requestSubmit();
						}}
					>
						Logout
					</DropdownMenu.Item>
				</form>
				<!-- 	//</form> -->
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
</header>
