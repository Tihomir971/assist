<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';

	type Props = {
		locale: string;
		localeLabel: string;
		value: string;
		fieldType: 'input' | 'textarea';
		placeholder?: string;
		disabled?: boolean;
		rows?: number;
		errors?: string[];
		isRequired?: boolean;
		onChange: (value: string) => void;
		onBlur?: () => void;
		onFocus?: () => void;
	};

	const {
		locale,
		localeLabel,
		value,
		fieldType,
		placeholder = undefined,
		disabled = false,
		rows = 3,
		errors = [],
		isRequired = false,
		onChange,
		onBlur = undefined,
		onFocus = undefined
	}: Props = $props();

	function handleInput(e: Event) {
		const target = e.currentTarget as HTMLInputElement | HTMLTextAreaElement;
		onChange(target.value);
	}
</script>

<div class="locale-field-group" data-locale={locale}>
	<div class="locale-header mb-1 flex items-center justify-between">
		<Label for="{locale}-{fieldType}" class="locale-label text-sm font-medium">
			{localeLabel}
			{#if isRequired}
				<span class="required-indicator text-destructive">*</span>
			{/if}
		</Label>
	</div>

	<div class="field-container">
		{#if fieldType === 'textarea'}
			<Textarea
				id="{locale}-{fieldType}"
				{value}
				oninput={handleInput}
				onblur={onBlur}
				onfocus={onFocus}
				{placeholder}
				{disabled}
				{rows}
				class="multilingual-textarea {errors.length > 0 ? 'border-destructive' : ''}"
			/>
		{:else}
			<Input
				id="{locale}-{fieldType}"
				{value}
				oninput={handleInput}
				onblur={onBlur}
				onfocus={onFocus}
				{placeholder}
				{disabled}
				type="text"
				class="multilingual-input {errors.length > 0 ? 'border-destructive' : ''}"
			/>
		{/if}
	</div>

	{#if errors.length > 0}
		<div class="field-errors mt-1">
			{#each errors as error}
				<p class="error-message text-xs text-destructive">{error}</p>
			{/each}
		</div>
	{/if}
</div>
