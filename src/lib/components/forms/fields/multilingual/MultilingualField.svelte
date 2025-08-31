<script lang="ts">
	import type { SuperForm } from 'sveltekit-superforms';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import { Alert } from '$lib/components/ui/alert';
	import LocaleTabs from './LocaleTabs.svelte';
	import LocaleFieldGroup from './LocaleFieldGroup.svelte';
	import { localeService } from '$lib/services/supabase/locale.service';
	import type {
		MultilingualData,
		LocaleLookup,
		LocaleFieldState
	} from '$lib/types/multilingual.types';
	import type { MultilingualFieldConfig } from '$lib/types/form-config.types';

	type Props = {
		value?: MultilingualData;
		name: string;
		superform: SuperForm<any>;
		config: MultilingualFieldConfig;
		fieldType: 'input' | 'textarea';
		label?: string;
		placeholder?: string;
		disabled?: boolean;
		errors?: string[];
		onChange?: (value: MultilingualData) => void;
		onLocaleChange?: (locale: string) => void;
	};

	let {
		value = $bindable({}),
		name,
		superform,
		config,
		fieldType,
		label,
		placeholder,
		disabled = false,
		errors,
		onChange,
		onLocaleChange
	}: Props = $props();

	const { form, errors: superformErrors } = superform;

	let activeLocale = $state('');
	let availableLocales = $state<LocaleLookup[]>([]);
	let isLoading = $state(true);
	let globalErrors = $state<string[]>([]);

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
			globalErrors = ['Failed to load locales.'];
		} finally {
			isLoading = false;
		}
	})();

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

	$effect(() => {
		if (errors && errors.length > 0) {
			globalErrors = Array.isArray(errors) ? errors : [String(errors)];
		} else {
			globalErrors = [];
		}
	});

	const activeLocaleLookup = $derived(availableLocales.find((l) => l.value === activeLocale));

	function handleLocaleChange(locale: string) {
		activeLocale = locale;
		onLocaleChange?.(locale);
	}

	function handleFieldChange(fieldValue: string) {
		const newData = { ...value, [activeLocale]: fieldValue || undefined };
		$form[name] = newData;
		onChange?.(newData);
	}

	// --- Placeholder handlers for Phase 3 ---
	function handleAddLocale(locale: string) {
		console.log('Add locale:', locale);
		// Logic to be implemented in Phase 3
	}

	function handleRemoveLocale(locale: string) {
		console.log('Remove locale:', locale);
		// Logic to be implemented in Phase 3
	}

	function handleCopyLocale(from: string, to: string) {
		console.log(`Copy from ${from} to ${to}`);
		// Logic to be implemented in Phase 3
	}
</script>

<div class="multilingual-field space-y-4 rounded-lg border p-4">
	<div class="field-header flex items-center justify-between">
		{#if label}
			<Label for={name} class="text-base font-semibold">{label}</Label>
		{/if}
		{#if config.required && config.required.length > 0}
			<Badge variant="secondary">Required: {config.required.join(', ')}</Badge>
		{/if}
	</div>

	{#if isLoading}
		<div class="text-muted-foreground">Loading locales...</div>
	{:else if availableLocales.length === 0}
		<Alert variant="destructive">No locales found.</Alert>
	{:else}
		<LocaleTabs
			{availableLocales}
			{activeLocale}
			fieldStates={fieldStates()}
			onLocaleChange={handleLocaleChange}
		/>

		<div class="active-field-group">
			{#if activeLocaleLookup}
				<LocaleFieldGroup
					locale={activeLocale}
					localeLabel={activeLocaleLookup.label}
					value={value[activeLocale] || ''}
					{fieldType}
					{placeholder}
					{disabled}
					errors={fieldStates()[activeLocale]?.errors || []}
					isRequired={fieldStates()[activeLocale]?.isRequired || false}
					onChange={handleFieldChange}
				/>
			{/if}
		</div>
	{/if}

	{#if globalErrors.length > 0}
		<div class="global-errors space-y-2">
			{#each globalErrors as error}
				<Alert variant="destructive">{error}</Alert>
			{/each}
		</div>
	{/if}
</div>
