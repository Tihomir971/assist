<script lang="ts" generics="TData">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { SelectZag } from '$lib/components/zag';
	import type {
		DataTableConfig,
		FilterDefinition,
		SelectFilterOption
	} from '$lib/utils/data-table-config.builder';
	import type { Table as TanstackTable } from '$lib/components/walker-tx';
	import { page } from '$app/state';

	type Props = {
		table: TanstackTable<TData>;
		config: DataTableConfig<TData>;
		globalFilter: string; // This will be bindable
		lookupData?: Record<string, SelectFilterOption[]>;
		onApplyFilters: () => void;
		onOpenDeleteDialog: (id: number) => void;
		onColumnFilterChange: (id: string, value: unknown) => void;
	};

	let {
		table,
		config,
		globalFilter = $bindable(),
		lookupData,
		onApplyFilters,
		onOpenDeleteDialog,
		onColumnFilterChange
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

	function applyFilters() {
		// This function is now only for server-side filtering via the button
		if (config.mode === 'server') {
			const params = new URLSearchParams();
			Object.entries(filterValues).forEach(([name, value]) => {
				if (value !== null && value !== '' && value !== undefined) {
					params.set(name, String(value));
				}
			});

			// Add global filter to params for server mode
			if (globalFilter) {
				params.set('globalFilter', globalFilter);
			}

			params.set('page', '1'); // Reset to first page when filtering
			window.location.href = `?${params.toString()}`;
			onApplyFilters();
		}
	}

	function clearFilters() {
		filterValues = {}; // Clear all specific filters
		globalFilter = ''; // Clear global filter
		if (config.mode === 'server') {
			window.location.href = page.url.pathname; // Navigate to clear all params
		} else {
			table.setGlobalFilter(''); // Clear client-side global filter
			config.filters.forEach((filter: FilterDefinition) => {
				const column = table.getColumn(filter.name);
				if (column) {
					column.setFilterValue(undefined); // Clear client-side column filters
				}
			});
		}
		onApplyFilters(); // Trigger re-render/re-fetch if needed
	}

	function handleGlobalFilterInput(event: Event) {
		const target = event.target as HTMLInputElement;
		globalFilter = target.value;
		if (config.mode === 'client') {
			table.setGlobalFilter(target.value);
		}
	}

	function handleFilterChange(id: string, value: unknown) {
		if (config.mode === 'client') {
			// Update local filter values for UI consistency
			filterValues[id] = value as string | number | null;
			// Apply the filter to TanStack Table
			onColumnFilterChange(id, value);
		}
	}
</script>

<Card.Title>{config.title}</Card.Title>
{#if config.filters.length > 0}
	<Card.Description>Filter {config.title.toLowerCase()} by various criteria</Card.Description>
{/if}
<div class="flex flex-wrap items-end gap-4">
	<!-- Global Filter -->
	<div class="min-w-[200px] flex-1">
		<Label for="globalFilter">Search</Label>
		<Input
			id="globalFilter"
			value={globalFilter}
			oninput={handleGlobalFilterInput}
			placeholder="Search all columns..."
		/>
	</div>

	<!-- Dynamic Filters -->
	{#each config.filters as filter (filter.name)}
		<div class="min-w-[200px] flex-1">
			{#if filter.type === 'text'}
				<Label for={filter.name}>{filter.label}</Label>
				<Input
					id={filter.name}
					bind:value={filterValues[filter.name]}
					oninput={(e) => handleFilterChange(filter.name, (e.target as HTMLInputElement).value)}
					placeholder={filter.placeholder || `Filter by ${filter.label.toLowerCase()}`}
				/>
			{:else if filter.type === 'select'}
				<SelectZag
					bind:value={filterValues[filter.name]}
					onValueChange={(detail) => handleFilterChange(filter.name, detail.value[0])}
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
						handleFilterChange(filter.name, boolValue);
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
		{#if config.mode === 'server'}
			<Button onclick={applyFilters}>Apply Filters</Button>
		{/if}
		<Button variant="outline" onclick={clearFilters}>Clear Filters</Button>
		{#if config.createButton}
			<Button href={config.createButton.href}>{config.createButton.label}</Button>
		{/if}
	</div>
</div>
