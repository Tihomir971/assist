<script lang="ts">
	import * as datepicker from '@zag-js/date-picker';
	import { portal, useMachine, normalizeProps } from '@zag-js/svelte';
	import Calendar from 'phosphor-svelte/lib/Calendar';

	const [snapshot, send] = useMachine(
		datepicker.machine({ id: '1', locale: 'sr-Latn', value: [datepicker.parse('2024-09-26')] })
	);
	const api = $derived(datepicker.connect(snapshot, send, normalizeProps));
</script>

<div {...api.getControlProps()}>
	<input {...api.getInputProps()} />
	<button {...api.getTriggerProps()}><Calendar size={32} weight="light" /></button>
</div>

<div use:portal {...api.getPositionerProps()}>
	<div {...api.getContentProps()}>
		<!-- Day View -->
		<div hidden={api.view !== 'day'}>
			<div {...api.getViewControlProps({ view: 'year' })}>
				<button {...api.getPrevTriggerProps()}>Prev</button>
				<button {...api.getViewTriggerProps()}>
					{api.visibleRangeText.start}
				</button>
				<button {...api.getNextTriggerProps()}>Next</button>
			</div>

			<table {...api.getTableProps({ view: 'day' })}>
				<thead {...api.getTableHeaderProps({ view: 'day' })}>
					<tr {...api.getTableRowProps({ view: 'day' })}>
						{#each api.weekDays as day, i (i)}
							<th scope="col" aria-label={day.long}>{day.narrow}</th>
						{/each}
					</tr>
				</thead>
				<tbody {...api.getTableBodyProps({ view: 'day' })}>
					{#each api.weeks as week, i (i)}
						<tr {...api.getTableRowProps({ view: 'day' })}>
							{#each week as value, i (i)}
								<td {...api.getDayTableCellProps({ value })}>
									<div {...api.getDayTableCellTriggerProps({ value })}>{value.day}</div>
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Month View -->
		<div hidden={api.view !== 'month'}>
			<div {...api.getViewControlProps({ view: 'month' })}>
				<button {...api.getPrevTriggerProps({ view: 'month' })}> Prev </button>
				<button {...api.getViewTriggerProps({ view: 'month' })}>
					{api.visibleRange.start.year}
				</button>
				<button {...api.getNextTriggerProps({ view: 'month' })}> Next </button>
			</div>

			<table {...api.getTableProps({ view: 'month', columns: 4 })}>
				<tbody {...api.getTableBodyProps({ view: 'month' })}>
					{#each api.getMonthsGrid({ columns: 4, format: 'short' }) as months, row (row)}
						<tr {...api.getTableRowProps()}>
							{#each months as month, index (index)}
								<td {...api.getMonthTableCellProps({ ...month, columns: 4 })}>
									<div {...api.getMonthTableCellTriggerProps({ ...month, columns: 4 })}>
										{month.label}
									</div>
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Year View -->
		<div hidden={api.view !== 'year'}>
			<div {...api.getViewControlProps({ view: 'year' })}>
				<button {...api.getPrevTriggerProps({ view: 'year' })}> Prev </button>
				<span>
					{api.getDecade().start} - {api.getDecade().end}
				</span>
				<button {...api.getNextTriggerProps({ view: 'year' })}> Next </button>
			</div>

			<table {...api.getTableProps({ view: 'year', columns: 4 })}>
				<tbody {...api.getTableBodyProps()}>
					{#each api.getYearsGrid({ columns: 4 }) as years, row (row)}
						<tr {...api.getTableRowProps({ view: 'year' })}>
							{#each years as year, index (index)}
								<td {...api.getYearTableCellProps({ ...year, columns: 4 })}>
									<div {...api.getYearTableCellTriggerProps({ ...year, columns: 4 })}>
										{year.label}
									</div>
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

<style>
	[data-scope='date-picker'][data-part='table-cell-trigger'] {
		padding: 4px;
		border-radius: 4px;
		text-align: center;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
	}

	[data-scope='date-picker'][data-part='table-cell-trigger']:hover {
		background: rgba(126, 126, 126, 0.171);
		/*background: rgba(126, 126, 126, 0.171);*/
	}

	[data-scope='date-picker'][data-part='table-cell-trigger'][data-focus] {
		background: rgba(165, 151, 165, 0.085);
		color: var(--colors-text-primary-bold);
	}

	[data-scope='date-picker'][data-part='table-cell-trigger'][data-outside-range] {
		visibility: hidden;
	}

	[data-scope='date-picker'][data-part='table-cell-trigger'][data-selected] {
		background: var(--colors-text-primary-bold) !important;
		color: white !important ;
	}

	[data-scope='date-picker'][data-part='table-cell-trigger'][data-in-range]:not([data-selected]) {
		background: rgb(240, 219, 240);
	}

	[data-scope='date-picker'][data-part='control'] {
		display: flex;
		gap: 10px;
		margin-top: 20px;
		margin-bottom: 16px;
	}

	[data-scope='date-picker'][data-part='table-cell-trigger'][data-today] {
		color: var(--colors-text-primary-bold);
	}

	[data-scope='date-picker'][data-part='table-cell-trigger'][data-unavailable] {
		text-decoration: line-through;
		opacity: 0.4;
	}

	[data-scope='date-picker'][data-part='table-cell-trigger'][data-disabled] {
		opacity: 0.4;
	}

	[data-scope='date-picker'][data-part='input'] {
		border-width: 1px;
		height: 2.5rem;
		padding-right: 1.25rem;
		padding-left: 0.75rem;
		/* background: var(--colors-bg-subtle); */
		background: hsl(var(--well-1));
		border-color: var(--colors-border-subtle);
		border-radius: 0.25rem;
	}

	[data-scope='date-picker'][data-part='trigger'] {
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--colors-bg-subtle);
		min-width: 40px;
		border-width: 1px;
	}

	[data-scope='date-picker'][data-part='content'] {
		box-shadow:
			0 1px 3px 0 rgba(0, 0, 0, 0.1),
			0 1px 2px 0 rgba(0, 0, 0, 0.06);
		isolation: isolate;
		padding: 1rem;
		background: hsl(var(--surface-3));
		border-radius: 0.25rem;
		overflow-y: auto;
	}

	[data-scope='date-picker'][data-part='table'] {
		min-width: 240px;
		max-height: 240px;
		overflow-y: auto;
		width: 100%;
		border-collapse: collapse;
		aspect-ratio: 1/1;
	}

	[data-scope='date-picker'][data-part='view-trigger'] {
		border: 0;
		padding: 4px 20px;
		border-radius: 4px;
		flex: 1;
		&:hover {
			background: var(--colors-bg-bold);
		}
	}

	[data-scope='date-picker']:is([data-part='next-trigger'], [data-part='prev-trigger']) {
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 4px;
		width: 32px;
		height: 32px;
		&:hover {
			background: var(--colors-bg-bold);
		}
	}

	[data-scope='date-picker'][data-part='view-control'] {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
		gap: 10px;
	}
</style>
