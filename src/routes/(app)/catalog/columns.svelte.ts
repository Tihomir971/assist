import { formatNumber } from '$lib/style/locale';
import { createRawSnippet } from 'svelte';
import DataTableActions from './data-table-actions.svelte';
import { createColumnHelper, renderComponent, renderSnippet } from '$lib/components/walker-tx';
import TableCheckbox from '$lib/components/walker-tx/table-checkbox.svelte';
import DataTableTitleCell from './data-table-title-cell.svelte';
import DataTableActionsVendor from './data-table-actions-vendor.svelte';
import type { Update } from '$lib/types/supabase/database.helper';

export interface Warehouse {
	value: string;
	label: string;
}
export interface ProductWithDetails {
	id: number;
	sku: string | null;
	name: string;
	mpn: string | null;
	unitsperpack: number;
	is_active: boolean;
	imageurl: string | null;
	discontinued: boolean;
	m_storageonhand: Update<'m_storageonhand'>[];
	m_product_packing: Update<'m_product_packing'>[];
	m_replenish: Update<'m_replenish'>[];
	c_taxcategory?: { c_tax: { rate: number }[] } | null;
	m_productprice: Update<'m_productprice'>[];
	m_product_po: {
		c_bpartner_id: number;
		pricelist: number | null;
		c_bpartner: Update<'c_bpartner'>;
	}[];
}
export interface FlattenedProduct {
	id: number;
	sku: string | null;
	name: string;
	mpn: string | null;
	unitsperpack: number | null;
	imageurl: string | null;
	discontinued: boolean;
	is_active?: boolean;
	taxRate: number | null;
	qtyWholesale: number;
	qtyRetail: number;
	pricePurchase: number | null;
	priceRetail: number | null;
	ruc: number;
	levelMin: number | null;
	levelMax: number | null;
	qtybatchsize: number | null;
	priceAgrofina: number | null;
	priceMercator: number | null;
	priceMivex: number | null;
	priceCenoteka: number | null;
	priceGros: number | null;
	priceMarketBest: number;
	priceVendorBest: number;
	action: boolean;
	priceMarket: {
		name: string;
		pricelist: number | null;
		tax: number | null;
		iscustomer: boolean;
	}[];
}

type RawSnippetParams = {
	value: string | number | null;
	isDanger?: boolean;
	action?: boolean;
};

const rightAlignSnippet = createRawSnippet<[RawSnippetParams]>((getValue) => {
	function refreshDisplay(): string {
		const { value, isDanger = false, action } = getValue();

		const className = isDanger ? 'text-right text-pink-700' : 'text-right';
		const dotClassName = action
			? 'inline-block w-1.5 h-1.5 bg-pink-700 rounded-full mr-1  align-middle'
			: '';
		return `
			<div class="${className}">
				${action ? `<span class="${dotClassName}"></span>` : ''}${value ?? ''}
			</div>
		`;
	}

	return {
		render: () => refreshDisplay(),
		setup: (node) => {
			$effect(() => {
				node.innerHTML = refreshDisplay();
			});
		}
	};
});

// Create a column helper for the user profile data.
const colHelp = createColumnHelper<FlattenedProduct>();
export const columnDefs = [
	colHelp.display({
		id: 'select',
		header: ({ table }) =>
			renderComponent(TableCheckbox, {
				checked:
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && 'indeterminate'),
				onchange: () => {
					table.toggleAllRowsSelected();
				}
			}),
		cell: ({ row }) =>
			renderComponent(TableCheckbox, {
				checked: row.getIsSelected(),
				onchange: () => {
					row.toggleSelected();
				}
			}),
		enableHiding: false
	}),
	colHelp.accessor('sku', {
		header: 'SKU',
		enableHiding: false
	}),
	colHelp.accessor('mpn', { header: 'MPN' }),
	colHelp.accessor('name', {
		header: 'Name',
		enableHiding: false,
		cell: ({ row }) => {
			const labels: { value: string; variant?: 'outline' | 'default' }[] = [];
			if (row.original.discontinued) {
				labels.push({ value: 'EOL', variant: 'outline' });
			}
			if (row.original.is_active === false) {
				labels.push({ value: 'Inactive', variant: 'outline' });
			}
			return renderComponent(DataTableTitleCell, {
				value: row.original.name,
				labels
			});
		}
	}),
	colHelp.accessor('taxRate', {
		header: 'Tax',
		cell: ({ cell }) => {
			return renderSnippet(rightAlignSnippet, {
				value: formatNumber(cell.getValue(), { style: 'percent', fractionDigits: 0 })
			});
		}
	}),
	colHelp.accessor('unitsperpack', {
		header: 'Pack',
		cell: ({ cell }) => {
			return renderSnippet(rightAlignSnippet, { value: cell.getValue() });
		}
	}),
	colHelp.accessor('qtyWholesale', {
		header: 'WH',
		cell: ({ cell }) => {
			return renderSnippet(rightAlignSnippet, { value: cell.getValue() });
		}
	}),
	colHelp.accessor('qtyRetail', {
		header: 'RT',
		cell: ({ cell }) => {
			return renderSnippet(rightAlignSnippet, { value: cell.getValue() });
		}
	}),
	colHelp.accessor('levelMin', {
		header: 'Min',
		cell: ({ row }) => {
			const levelMin = row.original.levelMin ?? 0;
			const qtyRetail = row.original.qtyRetail ?? 0;

			if (levelMin === null) {
				return null;
			}
			return renderSnippet(rightAlignSnippet, {
				value: levelMin,
				isDanger: qtyRetail < levelMin
			});
		}
	}),
	colHelp.accessor('levelMax', {
		header: 'Max',
		cell: ({ row }) => {
			// const levelMin = row.original.levelMin ?? 0;
			const levelMax = row.original.levelMax ?? 0;
			const stock = row.original.qtyRetail ?? 0;
			const batch = row.original.qtybatchsize ?? 0;
			return renderSnippet(rightAlignSnippet, {
				value: levelMax ?? '',
				isDanger: levelMax - stock >= batch && batch !== 0 && levelMax > 0
			});
		}
	}),
	/* colHelp.accessor('pricePurchase', { header: 'Purchase' }), */
	colHelp.accessor('pricePurchase', {
		header: 'Purchase',
		cell: ({ cell }) => {
			return renderSnippet(rightAlignSnippet, { value: formatNumber(cell.getValue()) });
		}
	}),
	colHelp.accessor('ruc', {
		header: 'RuC',
		cell: ({ cell }) => {
			return renderSnippet(rightAlignSnippet, {
				value: formatNumber(cell.getValue(), { style: 'percent', fractionDigits: 1 })
			});
		}
	}),
	colHelp.accessor('priceRetail', {
		header: 'Retail',
		cell: ({ row }) => {
			const priceRetail = row.original.priceRetail ?? 0;
			const priceCenoteka = row.original.priceCenoteka ?? 0;
			const qtyRetail = row.original.qtyRetail ?? 0;
			return renderSnippet(rightAlignSnippet, {
				value: formatNumber(priceRetail),
				isDanger:
					priceCenoteka !== 0 &&
					qtyRetail > 0 &&
					(priceRetail - priceCenoteka) / priceCenoteka >= 0.05,
				action: row.original.action
			});
		}
	}),
	colHelp.accessor('priceAgrofina', {
		header: 'Agrofina',
		cell: ({ cell }) => {
			return renderSnippet(rightAlignSnippet, { value: formatNumber(cell.getValue()) });
		}
	}),
	colHelp.accessor('priceMercator', {
		header: 'Mercator',
		cell: ({ cell }) => {
			return renderSnippet(rightAlignSnippet, { value: formatNumber(cell.getValue()) });
		}
	}),
	colHelp.accessor('priceMivex', {
		header: 'Mivex',
		cell: ({ cell }) => {
			return renderSnippet(rightAlignSnippet, { value: formatNumber(cell.getValue()) });
		}
	}),
	colHelp.accessor('priceGros', {
		header: 'Gros',
		cell: ({ cell }) => {
			return renderSnippet(rightAlignSnippet, { value: formatNumber(cell.getValue()) });
		}
	}),
	colHelp.accessor('priceCenoteka', {
		header: 'Cenoteka',
		cell: ({ cell }) => {
			return renderSnippet(rightAlignSnippet, { value: formatNumber(cell.getValue()) });
		}
	}),
	colHelp.accessor('priceVendorBest', {
		header: 'Vendors',
		cell: ({ row, cell }) => {
			return renderComponent(DataTableActionsVendor, {
				value: formatNumber(cell.getValue()) ?? '',
				iscustomer: false,
				priceMarket: row.original.priceMarket
			});
		},
		enableSorting: false,
		enableHiding: false
	}),
	colHelp.accessor('priceMarketBest', {
		header: 'Market',
		cell: ({ row, cell }) => {
			return renderComponent(DataTableActionsVendor, {
				value: formatNumber(cell.getValue()) ?? '',
				iscustomer: true,
				priceMarket: row.original.priceMarket
			});
		},
		enableSorting: false,
		enableHiding: false
	}),
	colHelp.accessor('id', {
		header: '',
		cell: ({ row }) => {
			return renderComponent(DataTableActions, { id: row.original.id.toString() });
		},
		enableSorting: false,
		enableHiding: false
	})
];
