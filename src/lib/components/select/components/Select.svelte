<script lang="ts">
	import { createSelect, melt } from '@melt-ui/svelte';
	import { fade } from 'svelte/transition';

	const options = {
		sweet: ['Caramel', 'Chocolate', 'Strawberry', 'Cookies & Cream'],
		savory: ['Basil', 'Bacon', 'Rosemary']
	};

	const {
		elements: { trigger, menu, option, group, groupLabel, label },
		states: { selectedLabel, open },
		helpers: { isSelected }
	} = createSelect({
		forceVisible: true,
		positioning: {
			placement: 'bottom',
			fitViewport: true,
			sameWidth: true
		}
	});
</script>

<!-- svelte-ignore a11y-label-has-associated-control - $label contains the 'for' attribute -->
<label class="form-control w-full max-w-xs" use:melt={$label}>
	<div class="label">
		<span class="label-text">Favorite Flavor</span>
	</div>
	<button class="select select-bordered w-full max-w-xs" use:melt={$trigger} aria-label="Food">
		{$selectedLabel || 'Select a flavor'}
	</button>
	{#if $open}
		<div
			class="menu w-56 rounded-box bg-base-200"
			use:melt={$menu}
			transition:fade={{ duration: 150 }}
		>
			{#each Object.entries(options) as [key, arr]}
				<li>
					<div use:melt={$group(key)}>
						<div
							class="py-1 pl-4 pr-4 font-semibold capitalize text-neutral-800"
							use:melt={$groupLabel(key)}
						>
							{key}
						</div>
						{#each arr as item}
							<div use:melt={$option({ value: item, label: item })}>
								<div class="check {$isSelected(item) ? 'block' : 'hidden'}">
									<iconify-icon icon="ph:check-bold" width="4" height="4"></iconify-icon>
								</div>

								{item}
							</div>
						{/each}
					</div>
				</li>
			{/each}
		</div>
	{/if}
</label>

<style lang="postcss">
	.check {
		position: absolute;
		left: theme(spacing.2);
		top: 50%;
		z-index: theme(zIndex.20);
		translate: 0 calc(-50% + 1px);
		color: theme(colors.orange.500);
	}
</style>
