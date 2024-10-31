import { formatNumber } from '$lib/style/locale';
import { createRawSnippet } from 'svelte';
import DataTableActions from './data-table-actions.svelte';
import SortableHeader from './sortable-header.svelte';
import { Checkbox } from '$lib/components/ui/checkbox/index.js';
import { createColumnHelper, renderComponent, renderSnippet } from '$lib/components/walker-tx';
import TableCheckbox from '$lib/components/walker-tx/table-checkbox.svelte';

export interface Warehouse {
	value: number;
	label: string;
}
export interface Product {
	id: number;
	sku: string;
	name: string;
	barcode: string;
	mpn: string;
	unitsperpack: number;
	imageurl: string;
	discontinued: boolean;
	c_taxcategory?: { c_tax: { rate: number }[] } | null;
	m_storageonhand: { warehouse_id: number; qtyonhand: number }[];
	productPrice: {
		m_pricelist_version_id: number;
		pricestd: number | null;
		pricelist: number | null;
	}[];
	priceListVersion: { m_pricelist_id: number; validfrom: Date; validto: Date }[];
	level_min: { m_warehouse_id: number; level_min: number }[];
	level_max: { m_warehouse_id: number; level_max: number }[];
	m_product_po: { c_bpartner_id: number; pricelist: number | null }[];
}
export interface FlattenedProduct {
	id: number;
	sku: string;
	name: string;
	barcode: string;
	mpn: string;
	unitsperpack: number;
	imageurl: string;
	discontinued: boolean;
	taxRate: number | null;
	qtyWholesale: number;
	qtyRetail: number;
	pricePurchase: number | null;
	priceRetail: number | null;
	ruc: number;
	levelMin: number | null;
	levelMax: number | null;
	priceAgrofina: number | null;
	priceMercator: number | null;
	priceMivex: number | null;
	priceCenoteka: number | null;
	priceGros: number | null;
	action: boolean;
}

const rightAlignSnippet = createRawSnippet<[string]>((getValue) => {
	const value = getValue() ?? 0;
	return {
		render: () => `<div class="text-right">${value}</div>`
	};
});
// Create a column helper for the user profile data.
const colHelp = createColumnHelper<FlattenedProduct>();
export const columnDefs = [
	colHelp.display({
		header: 'Select',
		cell: ({ row }) =>
			renderComponent(TableCheckbox, {
				checked: row.getIsSelected(),
				onchange: () => {
					row.toggleSelected();
				}
			})
	}),
	colHelp.accessor('sku', { header: 'SKU' }),
	colHelp.accessor('mpn', { header: 'MPN' }),
	colHelp.accessor('name', { header: 'Name' }),
	colHelp.accessor('taxRate', {
		header: 'Tax',
		cell: ({ row }) => {
			return renderSnippet(
				rightAlignSnippet,
				formatNumber(parseFloat(row.getValue('taxRate')), { style: 'percent', fractionDigits: 0 })
			);
		}
	}),
	colHelp.accessor('qtyWholesale', {
		header: 'WH',
		cell: ({ row }) => {
			return renderSnippet(rightAlignSnippet, row.getValue('qtyWholesale'));
		}
	}),
	colHelp.accessor('qtyRetail', {
		header: 'RT',
		cell: ({ row }) => {
			return renderSnippet(rightAlignSnippet, row.getValue('qtyRetail'));
		}
	}),
	colHelp.accessor('levelMin', {
		header: 'Min',
		cell: ({ row }) => {
			return renderSnippet(rightAlignSnippet, row.getValue('levelMin'));
		}
	}),
	colHelp.accessor('levelMax', {
		header: 'Max',
		cell: ({ row }) => {
			return renderSnippet(rightAlignSnippet, row.getValue('levelMax'));
		}
	}),
	colHelp.accessor('pricePurchase', {
		header: 'Purchase',
		cell: ({ row }) => {
			return renderSnippet(
				rightAlignSnippet,
				formatNumber(parseFloat(row.getValue('pricePurchase')))
			);
		}
	}),
	colHelp.accessor('ruc', {
		header: 'RuC',
		cell: ({ row }) => {
			return renderSnippet(
				rightAlignSnippet,
				formatNumber(parseFloat(row.getValue('ruc')), { style: 'percent' })
			);
		}
	}),
	colHelp.accessor('priceRetail', {
		header: 'Retail',
		cell: ({ row }) => {
			return renderSnippet(
				rightAlignSnippet,
				formatNumber(parseFloat(row.getValue('priceRetail')))
			);
		}
	}),
	colHelp.accessor('priceAgrofina', {
		header: 'Agrofina',
		cell: ({ row }) => {
			return renderSnippet(
				rightAlignSnippet,
				formatNumber(parseFloat(row.getValue('priceAgrofina')))
			);
		}
	}),
	colHelp.accessor('priceMercator', {
		header: 'Mercator',
		cell: ({ row }) => {
			return renderSnippet(
				rightAlignSnippet,
				formatNumber(parseFloat(row.getValue('priceMercator')))
			);
		}
	}),
	colHelp.accessor('priceMivex', {
		header: 'Mivex',
		cell: ({ row }) => {
			return renderSnippet(rightAlignSnippet, formatNumber(parseFloat(row.getValue('priceMivex'))));
		}
	}),
	colHelp.accessor('priceGros', {
		header: 'Gros',
		cell: ({ row }) => {
			return renderSnippet(rightAlignSnippet, formatNumber(parseFloat(row.getValue('priceGros'))));
		}
	})
];
/* export const columns: ColumnDef<FlattenedProduct>[] = [
	{ id: 'id', accessorKey: 'id', header: 'ID' },
	{
		id: 'select',
		header: ({ table }) =>
			renderComponent(Checkbox, {
				checked:
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && 'indeterminate'),
				onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
				controlledChecked: true,
				'aria-label': 'Select all'
			}),
		cell: ({ row }) =>
			renderComponent(Checkbox, {
				checked: row.getIsSelected(),
				onCheckedChange: (value) => row.toggleSelected(!!value),
				controlledChecked: true,
				'aria-label': 'Select row'
			}),
		enableSorting: false,
		enableHiding: false
	},
	{
		accessorKey: 'sku',
		header: 'SKU',
		enableHiding: false
	},
	{ id: 'MPN', accessorKey: 'mpn', header: 'MPN' },
	{
		accessorKey: 'name',
		header: ({ column }) =>
			renderComponent(SortableHeader, {
				name: 'Name',
				onclick: () => column.toggleSorting(column.getIsSorted() === 'asc')
			}),
		enableHiding: false
	},

	{
		id: 'Units per Pack',
		accessorKey: 'unitsperpack',
		header: () => {
			return renderSnippet(rightAlignSnippet, 'Pack');
		},
		cell: ({ row }) => {
			return renderSnippet(rightAlignSnippet, row.getValue('Units per Pack'));
		}
	},
	{
		id: 'Level Min',
		accessorKey: 'levelMin',
		header: () => {
			return renderSnippet(rightAlignSnippet, 'Min');
		},
		cell: ({ row }) => {
			return renderSnippet(rightAlignSnippet, row.getValue('Level Min'));
		}
	},
	{
		id: 'Level Max',
		accessorKey: 'levelMax',
		header: () => {
			return renderSnippet(rightAlignSnippet, 'Max');
		},
		cell: ({ row }) => {
			return renderSnippet(rightAlignSnippet, row.getValue('Level Max'));
		}
	},
	{
		id: 'Qty. Wholesale',
		accessorKey: 'qtyWholesale',
		header: () => {
			return renderSnippet(rightAlignSnippet, 'Who Qty.');
		},
		cell: ({ row, cell }) => {
			return renderSnippet(rightAlignSnippet, row.getValue('Qty. Wholesale'));
		}
	},
	{
		id: 'Retail Qty.',
		accessorKey: 'qtyRetail',
		header: () => {
			return renderSnippet(rightAlignSnippet, 'Ret Qty.');
		},
		cell: ({ row }) => {
			return renderSnippet(rightAlignSnippet, row.getValue('Retail Qty.'));
		}
	},
	{
		id: 'Tax',
		accessorKey: 'taxRate',
		header: () => {
			return renderSnippet(rightAlignSnippet, 'Tax');
		},
		cell: ({ row }) => {
			return renderSnippet(
				rightAlignSnippet,
				formatNumber(parseFloat(row.getValue('Tax')), {
					style: 'percent',
					fractionDigits: 0
				})
			);
		}
	},
	{
		id: 'Price Purchase',
		accessorKey: 'pricePurchase',
		header: () => {
			return renderSnippet(rightAlignSnippet, 'Purchase');
		},
		cell: ({ row }) => {
			return renderSnippet(
				rightAlignSnippet,
				formatNumber(parseFloat(row.getValue('Price Purchase')))
			);
		}
	},
	{
		id: 'RuC',
		accessorKey: 'ruc',
		header: () => {
			return renderSnippet(rightAlignSnippet, 'RuC');
		},
		cell: ({ row }) => {
			return renderSnippet(
				rightAlignSnippet,
				formatNumber(parseFloat(row.getValue('RuC')), { style: 'percent' })
			);
		}
	},
	{
		id: 'Price Retail',
		accessorKey: 'priceRetail',
		header: () => {
			return renderSnippet(rightAlignSnippet, 'Retail');
		},
		cell: ({ row }) => {
			return renderSnippet(
				rightAlignSnippet,
				formatNumber(parseFloat(row.getValue('Price Retail')))
			);
		}
	},
	{
		id: 'Agrofina',
		accessorKey: 'priceAgrofina',
		header: () => {
			return renderSnippet(rightAlignSnippet, 'Agrofina');
		},
		cell: ({ row }) => {
			const cellSnippet = createRawSnippet<[string]>((getValue) => {
				const value = getValue();
				return {
					render: () => `<div class="text-right">${value}</div>`
				};
			});

			return renderSnippet(cellSnippet, formatNumber(parseFloat(row.getValue('Agrofina'))));
		}
	},
	{
		id: 'Mercator',
		accessorKey: 'priceMercator',
		header: () => {
			return renderSnippet(rightAlignSnippet, 'Mercator');
		},
		cell: ({ row }) => {
			const cellSnippet = createRawSnippet<[string]>((getValue) => {
				const value = getValue();
				return {
					render: () => `<div class="text-right">${value}</div>`
				};
			});

			return renderSnippet(cellSnippet, formatNumber(parseFloat(row.getValue('Mercator'))));
		}
	},
	{
		id: 'Mivex',
		accessorKey: 'priceMivex',
		header: () => {
			return renderSnippet(rightAlignSnippet, 'Mivex');
		},
		cell: ({ row }) => {
			const cellSnippet = createRawSnippet<[string]>((getValue) => {
				const value = getValue();
				return {
					render: () => `<div class="text-right">${value}</div>`
				};
			});

			return renderSnippet(cellSnippet, formatNumber(parseFloat(row.getValue('Mivex'))));
		}
	},
	{
		id: 'Gros',
		accessorKey: 'priceGros',
		header: () => {
			return renderSnippet(rightAlignSnippet, 'Gros');
		},
		cell: ({ row }) => {
			const cellSnippet = createRawSnippet<[string]>((getValue) => {
				const value = getValue();
				return {
					render: () => `<div class="text-right">${value}</div>`
				};
			});

			return renderSnippet(cellSnippet, formatNumber(parseFloat(row.getValue('Gros'))));
		}
	},
	{
		id: 'Cenoteka',
		accessorKey: 'priceCenoteka',
		header: () => {
			return renderSnippet(rightAlignSnippet, 'Cenoteka');
		},
		cell: ({ row }) => {
			const cellSnippet = createRawSnippet<[string]>((getValue) => {
				const value = getValue();
				return {
					render: () => `<div class="text-right">${value}</div>`
				};
			});

			return renderSnippet(cellSnippet, formatNumber(parseFloat(row.getValue('Cenoteka'))));
		}
	},

	{
		id: 'actions',
		cell: ({ row }) => {
			// You can pass whatever you need from `row.original` to the component
			return renderComponent(DataTableActions, { id: row.original.id.toString() });
		},
		enableHiding: false
	}
]; */
