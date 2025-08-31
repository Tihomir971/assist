<script lang="ts">
	import type { SuperForm } from 'sveltekit-superforms';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Ellipsis, Copy, Clipboard, Clock, CircleAlert } from '@lucide/svelte';

	import LocaleTabs from './LocaleTabs.svelte';
	import { localeService } from '$lib/services/supabase/locale.service';
	import type {
		MultilingualData,
		LocaleLookup,
		LocaleFieldState
	} from '$lib/types/multilingual.types';
	import type { MultilingualFieldConfig } from '$lib/types/form-config.types';

	// --- PROPS ---
	interface MultilingualInputConfig extends MultilingualFieldConfig {}

	type Props = {
		value?: MultilingualData;
		name: string;
		superform: SuperForm<any>;
		config: MultilingualInputConfig;
		label?: string;
		placeholder?: string | MultilingualData;
		disabled?: boolean;
		required?: boolean;
		minLength?: number;
		pattern?: string | RegExp;
		autocomplete?: string;
		spellcheck?: boolean;
		suggestions?: string[];
		errors?: string[];
		onChange?: (value: MultilingualData) => void;
		onLocaleChange?: (locale: string) => void;
		onValidate?: (locale: string, value: string) => string[];
	};

	let {
		value = $bindable({}),
		name,
		superform,
		config,
		label = '',
		placeholder,
		disabled = false,
		onChange,
		onLocaleChange
	}: Props = $props();

	const { form, errors: superformErrors } = superform;

	// --- STATE ---
	let activeLocale = $state('');
	let availableLocales = $state<LocaleLookup[]>([]);
	let isLoading = $state(true);
	let hasUnsavedChanges = $state(false);
	let currentValue = $derived(value[activeLocale] || '');

	// --- LIFECYCLE ---
	(async () => {
		try {
			availableLocales = await localeService.getLocales();
			const defaultLocale = availableLocales.find((l) => l.isDefault)?.value || 'en-US';
			if (availableLocales.length > 0) {
				activeLocale = availableLocales.some((l) => l.value === defaultLocale)
					? defaultLocale
					: availableLocales[0].value;
			}
		} catch (e) {
			console.error(e);
		} finally {
			isLoading = false;
		}
	})();

	// --- DERIVED STATE ---
	const fieldStates = $derived(() => {
		const newFieldStates: Record<string, LocaleFieldState> = {};
		if (availableLocales.length > 0) {
			const localeErrors = ($superformErrors[name] as Record<string, string[]>) ?? {};
			for (const locale of availableLocales) {
				const hasContent = !!value[locale.value];
				const isRequired = !!config.required?.includes(locale.value);

				newFieldStates[locale.value] = {
					hasContent,
					isRequired,
					errors: (typeof localeErrors === 'object' && localeErrors[locale.value]) || []
				};
			}
		}
		return newFieldStates;
	});

	const activeErrors = $derived(fieldStates()[activeLocale]?.errors || []);

	$effect(() => {
		currentValue = value[activeLocale] || '';
	});

	// --- EVENT HANDLERS ---
	function handleLocaleChange(locale: string) {
		activeLocale = locale;
		onLocaleChange?.(locale);
	}

	function handleInput(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		currentValue = target.value;
		const newData = { ...value, [activeLocale]: currentValue || undefined };
		value = newData;
		$form[name] = newData;
		onChange?.(newData);
		hasUnsavedChanges = true;
	}

	function handleBlur() {
		if (hasUnsavedChanges) {
			// In a real app, you might trigger a save here.
			hasUnsavedChanges = false;
		}
	}

	// --- FEATURES ---
	async function copyToClipboard(locale: string) {
		if (!navigator.clipboard) return;
		await navigator.clipboard.writeText(value[locale] || '');
	}

	async function pasteFromClipboard(locale: string) {
		if (!navigator.clipboard) return;
		const text = await navigator.clipboard.readText();
		currentValue = text;
	}

	function copyToAllLocales(sourceLocale: string) {
		const sourceValue = value[sourceLocale];
		if (sourceValue === undefined) return;
		const newData = { ...value };
		for (const locale of availableLocales) {
			if (locale.value !== sourceLocale) {
				newData[locale.value] = sourceValue;
			}
		}
		value = newData;
		$form[name] = newData;
		hasUnsavedChanges = true;
	}
</script>

<div class="multilingual-input-wrapper space-y-3">
	<div class="mb-3 flex items-center justify-between">
		<LocaleTabs
			{availableLocales}
			{activeLocale}
			fieldStates={fieldStates()}
			onLocaleChange={handleLocaleChange}
		/>
	</div>

	<div class="input-container">
		<div class="input-field-wrapper">
			<Input
				bind:value={currentValue}
				placeholder={typeof placeholder === 'string' ? placeholder : placeholder?.[activeLocale]}
				{disabled}
				class="multilingual-input"
				oninput={handleInput}
				onblur={handleBlur}
			/>
		</div>
	</div>

	{#if activeErrors.length > 0}
		<div class="input-errors mt-2 space-y-2">
			{#each activeErrors as error}
				<Alert.Root variant="destructive" class="error-alert">
					<CircleAlert class="h-4 w-4" />
					<Alert.Description>{error}</Alert.Description>
				</Alert.Root>
			{/each}
		</div>
	{/if}
</div>
