<script lang="ts">
	import { NumberInputArk } from '$lib/components/ark';
	import Async from '$lib/components/ark/combobox/async.svelte';
	import { Field } from '@ark-ui/svelte/field';

	// export let data: PageData;
	let variable = $state(1325.53);
	$inspect(variable, 'variable');
</script>

<div class="p-16">
	<Field.Root readOnly required>
		<Field.Label>Field Label<Field.RequiredIndicator>*</Field.RequiredIndicator></Field.Label>
		<NumberInputArk
			name="Tihomir"
			bind:value={variable}
			formatOptions={{ maximumFractionDigits: 2 }}
		/>
		<Field.HelperText>Additional Info</Field.HelperText>
		<Field.ErrorText>Error Info</Field.ErrorText>
	</Field.Root>

	<hr class="my-4" />

	<NumberInputArk
		formatOptions={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
		defaultValue="1.00"
		name="Tihomir"
		bind:value={variable}
	/>

	<Async />
</div>
