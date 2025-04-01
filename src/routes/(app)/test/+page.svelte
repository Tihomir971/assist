<script lang="ts">
	import MyInput from '$lib/components/my/MyInput.svelte';
	import MyTextArea from '$lib/components/my/MyTextArea.svelte';

	// import CustomCombobox from './CustomCombobox.svelte';

	const items = [
		{ value: 'mango', label: 'Mango' },
		{ value: 'watermelon', label: 'Watermelon' },
		{ value: 'apple', label: 'Apple' }
	];
</script>

<!-- <CustomCombobox {items} /> -->
<div class="flex flex-col gap-4">
	<MyInput type="text" />
	<MyInput type="number" />
	<MyInput type="url" />
	<MyInput type="file" />
	<MyTextArea />
</div>
