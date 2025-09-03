<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { invalidate } from '$app/navigation';

	import {
		getLocaleManagerContextSafe,
		getLocaleManagerState
	} from '$lib/stores/locale-manager.svelte';
	import type { LocaleLookup } from '$lib/types/multilingual.types';

	import * as Card from '$lib/components/ui/card';
	import * as Select from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import Globe from '@lucide/svelte/icons/globe';
	import Check from '@lucide/svelte/icons/check';
	import AlertCircle from '@lucide/svelte/icons/alert-circle';

	interface Props {
		availableLocales: LocaleLookup[];
		currentLocale: string;
	}

	let { availableLocales, currentLocale = $bindable() }: Props = $props();

	// Get LocaleManager from context (safe approach)
	let localeManager = getLocaleManagerContextSafe();
	let localeState = getLocaleManagerState();

	// Local state for preview
	let selectedLocale = $state(currentLocale);
	let isPreviewMode = $state(false);
	let isSaving = $state(false);

	// Check if there are unsaved changes
	const hasChanges = $derived(selectedLocale !== currentLocale);

	// Handle locale selection
	function handleLocaleChange(value: string | undefined) {
		if (value) {
			selectedLocale = value;
			isPreviewMode = true;
		}
	}

	// Save changes
	async function saveChanges() {
		if (!hasChanges) return;

		if (!localeManager) {
			toast.error('LocaleManager not available. Please refresh the page and try again.');
			return;
		}

		isSaving = true;
		try {
			const success = await localeManager.updatePreferredDataLocale(selectedLocale);

			if (success) {
				toast.success('Locale preference updated successfully');
				// Update the current locale immediately to reflect the change
				currentLocale = selectedLocale;
				isPreviewMode = false;
				// Invalidate to refresh server data
				await invalidate('user:preferences');
			} else {
				toast.error(localeState?.error || 'Failed to update locale preference');
			}
		} catch (error) {
			console.error('Error saving locale preference:', error);
			toast.error('An error occurred while saving');
		} finally {
			isSaving = false;
		}
	}

	// Cancel changes
	function cancelChanges() {
		selectedLocale = currentLocale;
		isPreviewMode = false;
	}

	// Get locale display info
	function getLocaleInfo(localeValue: string) {
		return availableLocales.find((l) => l.value === localeValue);
	}
</script>

<Card.Root class="w-full">
	<Card.Header>
		<div class="flex items-center gap-2">
			<Globe class="h-5 w-5 text-muted-foreground" />
			<Card.Title>Data Localization Preferences</Card.Title>
		</div>
		<Card.Description>
			Choose the language for displaying data content (product names, categories, etc.)
		</Card.Description>
	</Card.Header>

	<Card.Content class="space-y-6">
		<!-- Current Settings -->
		<div class="space-y-3">
			<div class="flex items-center justify-between">
				<span class="text-sm font-medium">Current Data Language:</span>
				<Badge variant="secondary" class="flex items-center gap-1">
					<Check class="h-3 w-3" />
					{getLocaleInfo(currentLocale)?.label || currentLocale}
				</Badge>
			</div>

			<!-- Locale Selection -->
			<div class="space-y-2">
				<label for="locale-select" class="text-sm font-medium"> Select Data Language: </label>
				<Select.Root type="single" value={selectedLocale} onValueChange={handleLocaleChange}>
					<Select.Trigger id="locale-select" class="w-full">
						{getLocaleInfo(selectedLocale)?.label || 'Choose a language...'}
					</Select.Trigger>
					<Select.Content>
						{#each availableLocales as locale}
							<Select.Item value={locale.value}>
								<div class="flex w-full items-center justify-between">
									<span>{locale.label}</span>
									{#if locale.isDefault}
										<Badge variant="outline" class="ml-2 text-xs">Default</Badge>
									{/if}
								</div>
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		</div>

		<!-- Error Display -->
		{#if localeState?.error}
			<div
				class="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
			>
				<AlertCircle class="h-4 w-4" />
				<span>{localeState.error}</span>
			</div>
		{/if}

		<!-- Action Buttons -->
		{#if hasChanges}
			<div class="flex gap-2 pt-2">
				<Button
					onclick={saveChanges}
					disabled={isSaving || localeState?.isUpdating || !localeManager}
					class="flex items-center gap-2"
				>
					{#if isSaving || localeState?.isUpdating}
						<Loader2 class="h-4 w-4 animate-spin" />
						Saving...
					{:else}
						<Check class="h-4 w-4" />
						Save Changes
					{/if}
				</Button>

				<Button
					variant="outline"
					onclick={cancelChanges}
					disabled={isSaving || localeState?.isUpdating}
				>
					Cancel
				</Button>
			</div>
		{/if}

		<!-- Context Warning -->
		{#if !localeManager}
			<div class="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
				<AlertCircle class="h-4 w-4" />
				<span>LocaleManager not available. Changes cannot be saved. Please refresh the page.</span>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
