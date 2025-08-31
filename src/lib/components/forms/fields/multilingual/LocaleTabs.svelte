<script lang="ts">
	import { Crown } from '@lucide/svelte';
	import type { LocaleLookup, LocaleFieldState } from '$lib/types/multilingual.types';

	type Props = {
		availableLocales: LocaleLookup[];
		activeLocale: string;
		fieldStates: Record<string, LocaleFieldState>;
		onLocaleChange: (locale: string) => void;
	};

	const { availableLocales, activeLocale, fieldStates, onLocaleChange }: Props = $props();

	const activeLocaleLookup = $derived(availableLocales.find((l) => l.value === activeLocale));

	function getLocaleStatus(locale: string): 'valid' | 'error' | 'required' | 'empty' {
		const state = fieldStates[locale];
		if (!state) return 'empty';

		if (state.errors && state.errors.length > 0) {
			return 'error';
		}
		if (state.isRequired && !state.hasContent) {
			return 'required';
		}
		if (state.hasContent) {
			return 'valid';
		}
		return 'empty';
	}

	function getStatusTitle(locale: string): string {
		const status = getLocaleStatus(locale);
		switch (status) {
			case 'valid':
				return 'Content provided';
			case 'error':
				return 'Has validation errors';
			case 'required':
				return 'Required but empty';
			case 'empty':
				return 'No content';
			default:
				return '';
		}
	}
</script>

<div class="multilingual-tabs">
	<!-- More prominent tab design -->
	<div class="flex items-center gap-1 rounded-md border bg-muted p-1">
		{#each availableLocales as locale}
			<button
				type="button"
				role="tab"
				aria-selected={activeLocale === locale.value}
				aria-controls="locale-content-{locale.value}"
				class="flex items-center gap-2 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors
                       {activeLocale === locale.value
					? 'bg-background text-foreground shadow-sm'
					: 'text-muted-foreground hover:text-foreground'}"
				onclick={() => onLocaleChange(locale.value)}
			>
				<span>{locale.label}</span>
				{#if locale.isDefault}
					<Crown class="h-3 w-3" />
				{/if}
				<!-- Enhanced status indicator -->
				<div
					class="status-dot {getLocaleStatus(locale.value)}"
					title={getStatusTitle(locale.value)}
				></div>
			</button>
		{/each}
	</div>

	<!-- Current locale indicator -->
	{#if activeLocaleLookup}
		<div class="mt-1 text-xs text-muted-foreground">
			Currently editing: <span class="font-medium">{activeLocaleLookup?.label || activeLocale}</span>
		</div>
	{/if}
</div>

<style>
	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}
	.status-dot.valid {
		background-color: hsl(var(--success)); /* Use CSS variables */
	}
	.status-dot.error {
		background-color: hsl(var(--destructive));
	}
	.status-dot.required {
		background-color: hsl(var(--warning));
	}
	.status-dot.empty {
		background-color: hsl(var(--muted-foreground));
	}
</style>