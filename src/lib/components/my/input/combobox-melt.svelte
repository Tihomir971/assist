<script lang="ts">
	import { Combobox } from 'melt/builders';

	type Item = { value: string; label: string };
	type Props = { value: string; options: Item[] };

	type Option = (typeof options)[number]['value'];

	let { value = $bindable(), options }: Props = $props();

	const combobox = new Combobox<Option>();

	const filtered = $derived.by(() => {
		if (!combobox.touched) return options;
		return options.filter((o) =>
			o.label.toLowerCase().includes(combobox.inputValue.trim().toLowerCase())
		);
	});

	// Update input value when selection changes
	const selectedLabel = $derived.by(() => {
		if (combobox.value) {
			return options.find((o) => o.value === combobox.value)?.label;
		} else {
			return '';
		}
	});
</script>

<label for={combobox.ids.input}>Favorite Character</label>
<input {...combobox.input} name="hello" hidden />
<input value={selectedLabel} />
<button {...combobox.trigger}>open</button>
<div {...combobox.content}>
	{#each filtered as option (option.value)}
		<div {...combobox.getOption(option.value)}>
			{option.label}
			{#if combobox.isSelected(option.value)}
				✓
			{/if}
		</div>
	{:else}
		<span>No results found</span>
	{/each}
</div>
