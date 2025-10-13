<script lang="ts">
	import type { FieldConfig as AnalyzedFieldConfig } from '$lib/utils/schema-analyzer';
	import { Textarea } from '$lib/components/ui/textarea';

	interface SmartTextareaProps {
		field: AnalyzedFieldConfig; // Configuration for this field
		value: string | null | undefined; // Bound value
		[key: string]: any; // Allow additional props from Form.Control
	}

	let { field, value = $bindable(), ...restProps }: SmartTextareaProps = $props();

	// Auto-resize functionality
	let textareaElement: HTMLTextAreaElement | null = $state(null);

	// Auto-resize the textarea based on content
	function autoResize() {
		if (textareaElement) {
			textareaElement.style.height = 'auto';
			textareaElement.style.height = textareaElement.scrollHeight + 'px';
		}
	}

	// Auto-resize when value changes
	$effect(() => {
		if (value !== undefined) {
			// Use queueMicrotask for better performance than setTimeout
			queueMicrotask(autoResize);
		}
	});

	// Combine props for the textarea element
	const textareaAttrs = {
		rows: 3, // Default minimum rows
		// Add validation constraints if available
		minlength: field.componentProps?.min as number,
		maxlength: field.componentProps?.max as number,
		...restProps, // Spread Form.Control props first (includes name, id, aria attributes)
		// Then override with field-specific props if needed
		...(field.placeholder && { placeholder: field.placeholder }),
		// Finally, spread any custom props from the form config
		...(field.componentProps && (field.componentProps as Record<string, any>))
	};

	// Handle input events for auto-resize
	function handleInput(event: Event) {
		autoResize();
	}

	// Handle paste events for auto-resize
	function handlePaste() {
		// Use queueMicrotask to allow paste content to be processed
		queueMicrotask(autoResize);
	}
</script>

<!-- <div class="relative"> -->
<Textarea
	bind:ref={textareaElement}
	{...textareaAttrs}
	bind:value
	class="resize-none"
	oninput={handleInput}
	onpaste={handlePaste}
	style="min-height: 4rem; max-height: 12rem; overflow-y: auto;"
/>

{#if field.componentProps?.max}
	<div class="absolute right-2 bottom-2 text-xs text-muted-foreground">
		{value?.length || 0}/{field.componentProps.max}
	</div>
{/if}
<!-- </div> -->
