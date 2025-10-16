<script lang="ts">
	import type { SuperForm } from 'sveltekit-superforms';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import { Textarea } from '$lib/components/ui/textarea';
	import CircleAlertIcon from '@lucide/svelte/icons/circle-alert';

	import LocaleTabs from './LocaleTabs.svelte';
	import type { MultilingualData, LocaleFieldState } from '$lib/types/multilingual.types';
	import type { MultilingualFieldConfig } from '$lib/types/form-config.types';
	import type { Lookup } from '$lib/types/app';
	import { getLocales } from '$lib/services/supabase/locale.service.remote';
	import { getAppContext } from '$lib/context';

	// --- PROPS ---
	interface MultilingualTextareaConfig extends MultilingualFieldConfig {}

	type Props = {
		value?: MultilingualData;
		name: string;
		superform: SuperForm<any>;
		config: MultilingualTextareaConfig;
		label?: string;
		placeholder?: string | MultilingualData;
		disabled?: boolean;
		required?: boolean;
		rows?: number;
		minRows?: number;
		maxRows?: number;
		errors?: string[];
		onChange?: (value: MultilingualData) => void;
		onLocaleChange?: (locale: string) => void;
		availableLocales: Lookup<string>[];
	};

	let {
		value = $bindable({}),
		name,
		superform,
		config,
		placeholder,
		disabled = false,
		rows,
		onChange,
		onLocaleChange,
		availableLocales
	}: Props = $props();

	const { form, errors: superformErrors } = superform;

	// --- STATE ---
	let activeLocale = $state('');
	let isLoading = $state(true);
	let hasUnsavedChanges = $state(false);
	let currentValue = $derived(value[activeLocale] || '');

	// --- LIFECYCLE ---
	(async () => {
		try {
			const defaultLocale = getAppContext().userLocale;
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
		const target = e.currentTarget as HTMLTextAreaElement;
		currentValue = target.value;
		const newData = { ...value, [activeLocale]: currentValue || undefined };
		value = newData;
		$form[name] = newData;
		onChange?.(newData);
		hasUnsavedChanges = true;
	}
</script>

<div class="multilingual-textarea-wrapper space-y-3">
	<div class="textarea-header mb-3 flex items-center justify-between">
		<LocaleTabs
			{availableLocales}
			{activeLocale}
			fieldStates={fieldStates()}
			onLocaleChange={handleLocaleChange}
		/>
	</div>

	<div class="textarea-container">
		<Textarea
			bind:value={currentValue}
			placeholder={typeof placeholder === 'string' ? placeholder : placeholder?.[activeLocale]}
			{disabled}
			{rows}
			class="multilingual-textarea"
			oninput={handleInput}
		/>
	</div>

	{#if activeErrors.length > 0}
		<div class="textarea-errors mt-2 space-y-2">
			{#each activeErrors as error}
				<Alert.Root variant="destructive" class="error-alert">
					<CircleAlertIcon class="h-4 w-4" />
					<Alert.Description>{error}</Alert.Description>
				</Alert.Root>
			{/each}
		</div>
	{/if}
</div>
