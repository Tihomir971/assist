<script lang="ts" generics="TData">
	import { onDestroy } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type {
		DataTableConfig,
		FilterDefinition,
		SelectFilterOption
	} from '$lib/utils/data-table-config.builder';
	import type { Table as TanstackTable } from '$lib/components/walker-tx';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { debounce } from '$lib/scripts/debounce';
	import { SelectZag } from '$lib/components/zag';

	type Props = {
		table: TanstackTable<TData>;
		config: DataTableConfig<TData>;
		globalFilter: string; // This will be bindable
		lookupData?: Record<string, SelectFilterOption[]>;
		onOpenDeleteDialog: (id: number) => void;
	};

	let {
		table,
		config,
		globalFilter = $bindable(),
		lookupData,
		onOpenDeleteDialog
	}: Props = $props();

	// Reactive state for filters
	let filterValues = $state<Record<string, string | number | null>>({});

	// Initialize filter values from URL search params on component mount
	$effect(() => {
		config.filters.forEach((filter: FilterDefinition) => {
			const paramValue = page.url.searchParams.get(filter.name);
			if (paramValue !== null) {
				if (filter.dbType === 'number') {
					filterValues[filter.name] = Number(paramValue);
				} else if (filter.dbType === 'boolean') {
					filterValues[filter.name] = paramValue; // Keep as string 'true' or 'false'
				} else {
					filterValues[filter.name] = paramValue;
				}
			} else {
				filterValues[filter.name] = null; // Or a default empty value
			}
		});
		// Initialize global filter from URL if in server mode
		if (config.mode === 'server') {
			const globalFilterParam = page.url.searchParams.get('globalFilter');
			if (globalFilterParam !== null) {
				globalFilter = globalFilterParam; // Directly assign to bindable prop
			}
		}
	});

	function clearFilters() {
		filterValues = {}; // Clear all specific filters
		globalFilter = ''; // Clear global filter
		if (config.mode === 'server') {
			goto(page.url.pathname, { replaceState: true });
		} else {
			table.setGlobalFilter(''); // Clear client-side global filter
			config.filters.forEach((filter: FilterDefinition) => {
				const column = table.getColumn(filter.name);
				if (column) {
					column.setFilterValue(undefined); // Clear client-side column filters
				}
			});
		}
	}

	function handleGlobalFilterInput(event: Event) {
		const target = event.target as HTMLInputElement;
		globalFilter = target.value;
		if (config.mode === 'client') {
			table.setGlobalFilter(target.value);
		}
	}

	// Debounced version of applyFilters for text inputs - reduced delay for better UX
	const debouncedApplyFilters = debounce(() => {
		applyFilters();
	}, 250);

	// Clean up debounced function on component destroy
	onDestroy(() => {
		debouncedApplyFilters.cancel();
	});

	function handleFilterChange(id: string, value: unknown, filterType: string = 'select') {
		// Convert boolean values to strings for consistency with URL params
		if (typeof value === 'boolean') {
			filterValues[id] = value ? 'true' : 'false';
		} else {
			filterValues[id] = value as string | number | null;
		}

		if (config.mode === 'client') {
			const column = table.getColumn(id);
			if (column) {
				column.setFilterValue(value);
			}
		} else if (config.mode === 'server') {
			// For text inputs, apply filters automatically with debounce
			// For select/boolean inputs, apply immediately
			if (filterType === 'text') {
				debouncedApplyFilters();
			} else {
				applyFilters();
			}
		}
	}

	function applyFilters() {
		if (config.mode === 'server') {
			const params = new URLSearchParams(page.url.searchParams);
			config.filters.forEach((filter) => {
				const value = filterValues[filter.name];
				if (value !== null && value !== '' && value !== undefined) {
					params.set(filter.name, String(value));
				} else {
					params.delete(filter.name);
				}
			});
			params.set('page', '1');
			goto(`?${params.toString()}`, { replaceState: true });
		} else {
			const newColumnFilters = config.filters
				.map((filter) => {
					const value = filterValues[filter.name];
					return value !== null && value !== '' && value !== undefined
						? { id: filter.name, value }
						: null;
				})
				.filter(Boolean);
			table.setColumnFilters(newColumnFilters as any);
		}
	}
</script>

<Card.Title>{config.title}</Card.Title>
{#if config.filters.length > 0}
	<Card.Description>Filter {config.title.toLowerCase()} by various criteria</Card.Description>
{/if}
<div class="flex flex-wrap items-end gap-4">
	<!-- Global Filter -->
	{#if config.showGlobalFilter}
		<div class="min-w-[200px] flex-1">
			<Label for="globalFilter">Search</Label>
			<Input
				id="globalFilter"
				value={globalFilter}
				oninput={handleGlobalFilterInput}
				placeholder="Search all columns..."
			/>
		</div>
	{/if}

	<!-- Dynamic Filters -->
	{#each config.filters as filter (filter.name)}
		<div class="min-w-[200px] flex-1">
			{#if filter.type === 'text'}
				<Label for={filter.name}>{filter.label}</Label>
				<Input
					id={filter.name}
					bind:value={filterValues[filter.name]}
					oninput={(e) =>
						handleFilterChange(filter.name, (e.target as HTMLInputElement).value, 'text')}
					placeholder={filter.placeholder || `Filter by ${filter.label.toLowerCase()}`}
				/>
			{:else if filter.type === 'select'}
				<SelectZag
					bind:value={filterValues[filter.name]}
					onValueChange={(detail) => handleFilterChange(filter.name, detail.value[0], 'select')}
					items={filter.options || (lookupData ? lookupData[filter.lookupDataKey || ''] : [])}
					label={filter.label}
					placeholder={filter.placeholder || `All ${filter.label.toLowerCase()}`}
				/>
			{:else if filter.type === 'boolean'}
				<SelectZag
					bind:value={filterValues[filter.name]}
					onValueChange={(detail) => {
						const value = Array.isArray(detail.value) ? detail.value[0] : detail.value;
						const boolValue = value === 'true' ? true : value === 'false' ? false : null;
						handleFilterChange(filter.name, boolValue, 'boolean');
					}}
					items={[
						{ value: 'true', label: 'Checked' },
						{ value: 'false', label: 'Unchecked' }
					]}
					label={filter.label}
					placeholder={filter.placeholder || `All ${filter.label.toLowerCase()}`}
				/>
			{/if}
		</div>
	{/each}

	<!-- Action Buttons -->
	<div class="flex items-end gap-2">
		<Button variant="outline" onclick={clearFilters}>Clear Filters</Button>
		{#if config.createButton}
			<Button href={config.createButton.href}>{config.createButton.label}</Button>
		{/if}
	</div>
</div>
