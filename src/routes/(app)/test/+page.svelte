<script lang="ts">
	async function getPrice() {
		const price = await (await fetch('/api/gigatron/1230')).json();

		console.log('price', price);
	}
</script>

<button on:click={getPrice} class="btn btn-primary">Test</button>
<div class="divider"></div>
