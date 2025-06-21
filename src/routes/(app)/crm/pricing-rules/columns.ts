export const pricingRulesColumns = [
	{
		key: 'name',
		label: 'Ime pravila',
		sortable: true,
		className: 'font-medium'
	},
	{
		key: 'formulaLabel',
		label: 'Tip formule',
		className: 'w-32'
	},
	{
		key: 'partnerCount',
		label: 'Partneri',
		type: 'number',
		className: 'text-center w-20'
	},
	{
		key: 'categoryCount',
		label: 'Kategorije',
		type: 'number',
		className: 'text-center w-20'
	},
	{
		key: 'brandCount',
		label: 'Brendovi',
		type: 'number',
		className: 'text-center w-20'
	},
	{
		key: 'attributeCount',
		label: 'Atributi',
		type: 'number',
		className: 'text-center w-20'
	},

	{
		key: 'is_active',
		label: 'Aktivno',
		type: 'boolean',
		className: 'text-center w-20'
	},
	{
		key: 'target_group',
		label: 'Grupa',
		optional: true,
		className: 'text-muted-foreground'
	},

	{
		key: 'starts_at',
		label: 'Start',
		type: 'date',
		className: 'text-sm text-muted-foreground w-32'
	},
	{
		key: 'ends_at',
		label: 'End',
		type: 'date',
		className: 'text-sm text-muted-foreground w-32'
	},
	{
		key: 'priority',
		label: 'Prioritet',
		sortable: true,
		className: 'text-center w-24'
	}
	// Uklonjena 'actions' kolona odavde, dodaje se ručno u Svelte komponenti
];
