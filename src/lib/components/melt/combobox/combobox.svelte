<script lang="ts">
	import { Combobox } from 'melt/builders';
	import AlphabetJapanese from '~icons/hugeicons/alphabet-japanese';
	import Check from '~icons/lucide/check';
	import ChevronDown from '~icons/lucide/chevron-down';

	const options = [
		'Sung Jinwoo',
		'Ichigo Kurosaki',
		'Guts',
		'Light Yagami',
		'Naruto Uzumaki',
		'Goku',
		'Eren Jaeger'
	] as const;
	type Option = (typeof options)[number];

	const combobox = new Combobox<Option, boolean>({
		forceVisible: true
	});

	const filtered = $derived.by(() => {
		if (!combobox.touched) return options;
		return options.filter((o) =>
			o.toLowerCase().includes(combobox.inputValue.trim().toLowerCase())
		);
	});
</script>

<div class="mx-auto flex w-[300px] flex-col gap-1">
	<label for={combobox.ids.input}>Favorite Character</label>
	<div class="relative text-left text-gray-800 transition dark:text-gray-200">
		<AlphabetJapanese class="abs-y-center absolute left-3 shrink-0" />
		<input
			{...combobox.input}
			class="w-full rounded-xl border border-gray-500 bg-gray-100 py-2 pl-9 text-left
					focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-50
					dark:bg-gray-900"
			type="text"
		/>
		<button
			class="abs-y-center absolute right-3 grid shrink-0 place-items-center rounded-md
					dark:bg-gray-700 dark:hover:bg-gray-500 dark:active:bg-gray-600"
			{...combobox.trigger}
		>
			<ChevronDown />
		</button>
	</div>
	<span
		class={[
			'opacity-75',
			!(combobox.multiple && combobox.valueAsString) && 'pointer-events-none invisible'
		]}
	>
		Selected: {combobox.valueAsString}
	</span>

	<div
		{...combobox.content}
		class="flex flex-col rounded-xl border border-gray-500 bg-gray-100 p-2 shadow dark:bg-gray-800"
	>
		{#each filtered as option (option)}
			<div
				{...combobox.getOption(option)}
				class={[
					'relative flex items-center justify-between rounded-xl py-2 pr-2 pl-8',
					combobox.highlighted === option && 'bg-gray-700',
					combobox.value === option && 'font-semibold'
				]}
			>
				<span>{option}</span>
				{#if combobox.isSelected(option)}
					<Check class="text-accent-300 font-bold" />
				{/if}
			</div>
		{:else}
			<span class="opacity-50 py-2 pl-8 pr-2">No results found</span>
		{/each}
	</div>
</div>

<style>
	[data-melt-combobox-content] {
		position: absolute;
		pointer-events: none;
		opacity: 0;

		transform: scale(0.975);

		transition: 0.2s;
		transition-property: opacity, transform;
		transform-origin: var(--melt-popover-content-transform-origin, center);
	}

	[data-melt-combobox-content][data-open] {
		pointer-events: auto;
		opacity: 1;

		transform: scale(1);
	}
</style>
