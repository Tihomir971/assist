<script lang="ts">
	import { page } from '$app/stores';
	import { PUBLIC_BEARER_TOKEN } from '$env/static/public';

	export let selectedProducts: number[];

	async function getPrices() {
		const apiUrl = 'http://192.168.1.10:4443/cenoteka/prods';
		const myHeaders = new Headers({ Authorization: 'Bearer ' + PUBLIC_BEARER_TOKEN });
		const formData = new FormData();
		formData.append('prods', JSON.stringify(selectedProducts));

		try {
			const response = await fetch(apiUrl, {
				method: 'POST',
				body: formData,
				headers: myHeaders
			});
			if (!response.ok) {
				throw new Error(`Network response was not OK: ${response.statusText}`);
			}

			const data = await response.text();
		} catch (error) {
			if (error instanceof TypeError && error.message === 'Failed to fetch') {
				console.error('Failed to fetch:', error.message);
			} else {
				console.error('There has been a problem with your fetch operation:', error);
			}
		}
	}

	async function getERP() {
		const apiUrl = 'http://192.168.1.10:4443/bizsoft/assistant/sync/prods';
		const myHeaders = new Headers({ Authorization: 'Bearer ' + PUBLIC_BEARER_TOKEN });
		const formData = new FormData();
		formData.append('prods', JSON.stringify(selectedProducts));

		try {
			const response = await fetch(apiUrl, {
				method: 'POST',
				body: formData,
				headers: myHeaders
			});
			if (!response.ok) {
				throw new Error(`Network response was not OK: ${response.statusText}`);
			}

			const data = await response.text();
		} catch (error) {
			if (error instanceof TypeError && error.message === 'Failed to fetch') {
				console.error('Failed to fetch:', error.message);
			} else {
				console.error('There has been a problem with your fetch operation:', error);
			}
		}
	}
</script>

<header class="flex h-full items-center justify-between px-4">
	<button class="btn variant-soft" on:click={getPrices}>Get prices</button>
	<button class="btn variant-soft" on:click={getERP}>Get ERP</button>
</header>
<!-- <script lang="ts">
//	import { createSelect, melt } from '@melt-ui/svelte';
//	import type { CreateSelectProps, SelectOption } from '@melt-ui/svelte';

	import { fade } from 'svelte/transition';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Select, Switch } from '$lib/components/melt-ui';
	import { PUBLIC_BEARER_TOKEN } from '$env/static/public';
	export let selectedProducts: number[];
	let checked = true;
	const options: SelectOption<number>[] = [
		{ value: 5, label: 'Retail T' },
		{ value: 6, label: 'Service T' },
		{ value: 2, label: 'Wholesale T' }
	];
	const onSelectedChange: CreateSelectProps['onSelectedChange'] = ({ next }) => {
		const stringValue: string = (next?.value as number)?.toString();
		if (next !== undefined) {
			const newUrl = new URL($page.url);
			newUrl?.searchParams?.set('wh', stringValue);
			goto(newUrl);
		}
		return next;
	};
	/* 	const onSelected = ({ next }:{next: SelectOption<number>}) => { */
	const onSelected = ({ detail }: CustomEvent) => {
		const next = detail.next;
		const stringValue: string = (next?.value as number)?.toString();
		if (next !== undefined) {
			const newUrl = new URL($page.url);
			newUrl?.searchParams?.set('wh', stringValue);
			goto(newUrl);
		}
		return;
	};
	const {
		elements: { trigger, menu, option, label },
		states: { selectedLabel, open, selected },
		helpers: { isSelected }
	} = createSelect({
		defaultSelected: options[0],
		forceVisible: true,
		positioning: {
			placement: 'bottom',
			fitViewport: true,
			sameWidth: true
		},
		onSelectedChange
	});
	const switchOnStock = () => {
		checked = !checked;
		const newUrl = new URL($page.url);
		newUrl?.searchParams?.set('onStock', checked ? 'true' : 'false');
		goto(newUrl);
	};


	
</script>

<header class="flex h-full items-center justify-between px-4">
	<Select {options} defaultSelected={options[0]} on:onSelectedChange={onSelected}></Select>
	<button class="btn" on:click={getPrices}>Get prices</button>
	<button class="btn" on:click={getERP}>Get ERP</button>
	<Switch label="Only on Stock?" bind:checked on:m-click={switchOnStock}></Switch>
</header>
 -->
