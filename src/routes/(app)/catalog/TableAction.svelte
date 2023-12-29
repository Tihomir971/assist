<script lang="ts">
	import { goto } from '$app/navigation';
	import { AlignJustify, X } from 'lucide-svelte';

	import { createDialog, createDropdownMenu, melt } from '@melt-ui/svelte';
	import { DropdownMenu, Content, Triger, Item } from '$lib/components/dropdown';
	import { fade, fly } from 'svelte/transition';
	import { Dialog, DialogTitle, getCtx } from '$lib/components/dialog';
	const {
		elements: { menu, item, trigger, arrow }
	} = createDropdownMenu({ positioning: { placement: 'top' } });

	export let id: string | undefined;

	const {
		elements: { trigger: triggerDrawer, overlay, content, title, description, close, portalled },
		states: { open }
	} = createDialog({
		forceVisible: true
	});
	/* 
	const {
		elements: { trigger: trigger2, portalled: portalled2, overlay: overlay2, content: content2 },
		states: { open: open2 }
	} = getCtx(); */
	//	let comboboxValue: string;

	//	const popupCombobox: PopupSettings = {
	//		event: 'click',
	//		target: 'popupCombobox',
	//		placement: 'bottom',
	//		closeQuery: '.listbox-item',
	//		state: (e: Record<string, boolean>) => console.log(e)
	//	};
	//	let open = false;
</script>

<DropdownMenu>
	<Triger>
		<AlignJustify />
		<span class="sr-only">Open Row Actions</span>
	</Triger>
	<Content>
		<Item on:click={() => goto(`/catalog/product/${id}`)}>Edit</Item>
		<Item>
			<button use:melt={$triggerDrawer}>Modal</button>
		</Item>

		<Item>Delete</Item>
	</Content>
</DropdownMenu>

<!-- <div class="" use:melt={$portalled2}>
	{#if $open2}
		<div use:melt={$overlay2} class="overlay" />
		<div
			use:melt={$content2}
			class="content"
			transition:fly={{
				x: -350,
				duration: 300,
				opacity: 1
			}}
		>
			Its me
		</div>
	{/if}
</div> -->

<div class="" use:melt={$portalled}>
	{#if $open}
		<div
			use:melt={$overlay}
			class="fixed inset-0 z-50 bg-black/50"
			transition:fade={{ duration: 150 }}
		/>
		<div
			use:melt={$content}
			class="fixed left-0 top-0 z-50 h-screen w-full max-w-[350px] bg-white p-6
			  shadow-lg focus:outline-none"
			transition:fly={{
				x: -350,
				duration: 300,
				opacity: 1
			}}
		>
			<button
				use:melt={$close}
				aria-label="Close"
				class="text-magnum-800 hover:bg-magnum-100 focus:shadow-magnum-400 focus:ring-magnum-400 absolute right-[10px]
				  top-[10px] inline-flex h-6 w-6 appearance-none
				  items-center justify-center rounded-full focus:outline-none
				  focus:ring-2"
			>
				<X class="square-4" />
			</button>
			<h2 use:melt={$title} class="mb-0 text-lg font-medium text-black">Notifications</h2>
			<p use:melt={$description} class="mb-5 mt-2 leading-normal text-zinc-600">
				Check out your latest updates.
			</p>
			<section>
				<div class="rounded-md bg-gray-100/80 p-4 text-zinc-800 shadow">
					<h3 class="mb-3 text-base font-semibold">New invitation</h3>
					<p class="text-sm">
						You have been invited to join the <strong>Designers</strong> team.
					</p>
					<div class="mt-6 flex justify-end gap-4">
						<button
							class="focus:ring-magnum-400 inline-flex h-8 items-center
							  justify-center rounded-[4px] bg-zinc-100 px-4 font-medium
							  leading-none text-zinc-600 focus:outline-none
							  focus:ring-2"
						>
							Reject
						</button>
						<button
							class="bg-magnum-100 text-magnum-900 focus:ring-magnum-400 inline-flex
							  h-8 items-center justify-center rounded-[4px] px-4
							  font-medium leading-none focus:outline-none
							  focus:ring-2"
						>
							Accept
						</button>
					</div>
				</div>
			</section>
		</div>
	{/if}
</div>

<style class="postcss">
	.trigger {
		display: inline-flex;
		align-items: center;
		justify-content: center;

		padding: 0.5rem 1rem;

		border-radius: 0.375rem;

		background-color: rgb(var(--color-white) / 1);

		font-weight: 500;
		line-height: 1;

		color: rgb(var(--color-magnum-700) / 1);

		box-shadow:
			0 10px 15px -3px rgb(var(--color-black) / 0.1),
			0 4px 6px -4px rgb(var(--color-black) / 0.1);
	}

	.trigger:hover {
		opacity: 0.75;
	}

	.overlay {
		position: fixed;
		inset: 0;
		z-index: 50;

		background-color: rgb(0 0 0 / 0.5);
	}

	.content {
		position: fixed;
		right: 0;
		top: 0;
		z-index: 50;
		height: 100vh;
		max-width: 500px;
		width: 100%;
		padding: 1.5rem;
		background-color: rgb(255 255 255 / 1);
		box-shadow:
			0 10px 15px -3px rgb(var(--color-black) / 0.1),
			0 4px 6px -4px rgb(var(--color-black) / 0.1);
	}

	.content:focus {
		outline: 2px solid transparent;
		outline-offset: 2px;
	}

	.close {
		display: inline-flex;
		align-items: center;
		justify-content: center;

		position: absolute;
		right: 10px;
		top: 10px;

		appearance: none;

		height: 1.5rem;
		width: 1.5rem;

		border-radius: 9999px;

		color: rgb(var(--color-magnum-800) / 1);
	}

	.close:hover {
		background-color: rgb(var(--color-magnum-100) / 1);
	}

	.close:focus {
		outline: 2px solid transparent;
		outline-offset: 2px;

		box-shadow: 0px 0px 0px 3px rgb(var(--color-magnum-400) / 1);
	}

	.title {
		margin: 0;

		font-size: 1.125rem;
		line-height: 1.75rem;
		font-weight: 500;

		color: rgb(var(--color-black) / 1);
	}

	.description {
		margin-bottom: 1.25rem;
		margin-top: 0.5rem;

		line-height: 1.5;

		color: rgb(var(--color-zinc-600) / 1);
	}

	.invitation {
		border-radius: 0.375rem;
		background-color: rgb(var(--color-grey-100) / 0.8);

		color: rgb(var(--color-zinc-800) / 1);

		box-shadow:
			0 1px 3px 0 rgb(0 0 0 / 0.1),
			0 1px 2px -1px rgb(0 0 0 / 0.1);
	}

	.invitation h3 {
		margin-bottom: 0.75rem;

		font-size: 1rem;
		line-height: 1.5rem;
		font-weight: 600;
	}

	.invitation p {
		font-size: 0.875rem;
		line-height: 1.25rem;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;

		margin-top: 1.5rem;
	}

	.actions button {
		display: inline-flex;
		align-items: center;
		justify-content: center;

		height: 2rem;

		border-radius: 0.25rem;

		padding: 0 1rem;

		font-weight: 500;
		line-height: 1;
	}

	.actions button.secondary {
		background-color: rgb(var(--color-zinc-100) / 1);

		color: rgb(var(--color-zinc-600) / 1);
	}

	.actions button.primary {
		background-color: rgb(var(--color-magnum-100) / 1);

		color: rgb(var(--color-magnum-900) / 1);
	}
</style>
