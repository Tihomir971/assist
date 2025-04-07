<script lang="ts">
	import { Combobox } from 'melt/builders';

	type Item = { value: string; label: string };
	const options: Item[] = [
		{ value: '1', label: 'Mango' },
		{ value: '2', label: 'Ananas' }
	];

	const combobox = new Combobox<string, false>({ value: '2' });

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
<input {...combobox.input} name="hello" />
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
