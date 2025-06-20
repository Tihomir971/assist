<script lang="ts">
	import type { SmartSplitLayoutProps } from '$lib/types/split-layout-config.types';
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	interface Props extends SmartSplitLayoutProps {
		leftPanel: Snippet;
		rightPanel: Snippet;
	}

	let { config = {}, leftPanel, rightPanel }: Props = $props();

	// Default configuration
	const defaultConfig = {
		leftPanel: {
			width: '45%',
			minWidth: '400px',
			scrollable: true,
			title: undefined,
			className: undefined,
			maxWidth: undefined
		},
		rightPanel: {
			width: '55%',
			minWidth: '500px',
			scrollable: true,
			title: undefined,
			className: undefined,
			maxWidth: undefined
		},
		responsive: {
			breakpoint: '768px',
			stackOrder: 'form-first' as const,
			mobileGap: undefined
		},
		gap: '1rem',
		className: undefined
	};

	const finalConfig = {
		...defaultConfig,
		...config,
		leftPanel: { ...defaultConfig.leftPanel, ...config.leftPanel },
		rightPanel: { ...defaultConfig.rightPanel, ...config.rightPanel },
		responsive: { ...defaultConfig.responsive, ...config.responsive }
	};
	const { leftPanel: leftConfig, rightPanel: rightConfig, responsive, gap } = finalConfig;

	// Generate CSS custom properties for responsive behavior
	const cssVars = {
		'--left-width': leftConfig.width,
		'--left-min-width': leftConfig.minWidth,
		'--right-width': rightConfig.width,
		'--right-min-width': rightConfig.minWidth,
		'--gap': gap,
		'--breakpoint': responsive.breakpoint
	};
</script>

<div
	class={cn(
		'smart-split-layout',
		'flex flex-col lg:flex-row',
		'h-full w-full',
		responsive.stackOrder === 'tabs-first' && 'flex-col-reverse lg:flex-row',
		config.className
	)}
	style={Object.entries(cssVars)
		.map(([key, value]) => `${key}: ${value}`)
		.join('; ')}
>
	<!-- Left Panel -->
	<div
		class={cn(
			'smart-split-layout__left',
			'flex-shrink-0',
			'w-full lg:w-[var(--left-width)]',
			'min-w-[var(--left-min-width)]',
			leftConfig.scrollable && 'overflow-auto',
			'mb-4 lg:mr-[var(--gap)] lg:mb-0',
			leftConfig.className
		)}
	>
		{#if leftConfig.title}
			<div class="mb-4">
				<h2 class="text-lg font-semibold">{leftConfig.title}</h2>
			</div>
		{/if}
		{@render leftPanel()}
	</div>

	<!-- Right Panel -->
	<div
		class={cn(
			'smart-split-layout__right',
			'flex-1',
			'w-full lg:w-[var(--right-width)]',
			'min-w-[var(--right-min-width)]',
			rightConfig.scrollable && 'overflow-auto',
			rightConfig.className
		)}
	>
		{#if rightConfig.title}
			<div class="mb-4">
				<h2 class="text-lg font-semibold">{rightConfig.title}</h2>
			</div>
		{/if}
		{@render rightPanel()}
	</div>
</div>

<style>
	.smart-split-layout {
		container-type: inline-size;
	}

	@container (max-width: 768px) {
		.smart-split-layout {
			flex-direction: column;
		}

		.smart-split-layout__left,
		.smart-split-layout__right {
			width: 100% !important;
			min-width: unset !important;
		}
	}
</style>
