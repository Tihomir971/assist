import DataTableActions from './data-table-actions.svelte';
import { createColumnHelper, renderComponent, renderSnippet } from '$lib/components/walker-tx';
import TableCheckbox from '$lib/components/walker-tx/table-checkbox.svelte';
import DataTableTitleCell from './data-table-title-cell.svelte';
import DataTableActionsVendor from './data-table-actions-vendor.svelte';

import type {
	CBpartnerUpdate,
	MProductPackingUpdate,
	MProductpriceUpdate,
	MReplenishUpdate,
	MStorageonhandUpdate
} from '@tihomir971/assist-shared';
import { NumberFormatter } from '$lib/scripts/intl';
import { rightAlignSnippet } from '$lib/utils/common-snippets.svelte';

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
	net_quantity: number | null;
	m_storageonhand: MStorageonhandUpdate[];
	m_product_packing: MProductPackingUpdate[];
	m_replenish: MReplenishUpdate[];
	c_taxcategory?: { c_tax: { rate: number }[] } | null;
	m_productprice: MProductpriceUpdate[];
	m_product_po: {
		c_bpartner_id: number;
		pricelist: number | null;
		c_bpartner: CBpartnerUpdate;
	}[];
	m_product_brands?: { name: string } | null;
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
	price_uom: number | null;
	// priceAgrofina: number | null;
	// priceMercator: number | null;
	// priceMivex: number | null;
	// priceCenoteka: number | null;
	// priceGros: number | null;
	priceMarketBest: number;
	priceVendorBest: number;
	action: boolean;
	priceMarket: {
		name: string;
		pricelist: number | null;
		tax: number | null;
		iscustomer: boolean;
	}[];
	brand: string | null;
}

const numberFormatter = new NumberFormatter();

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
	colHelp.accessor('brand', { header: 'Brand' }),
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
				value: numberFormatter.formatPercent(cell.getValue(), {
					fractionDigits: 0
				})
			});
		},
		enableSorting: false
	}),
	colHelp.accessor('unitsperpack', {
		header: 'Pack',
		cell: ({ cell }) => {
			return renderSnippet(rightAlignSnippet, { value: cell.getValue() });
		},
		enableSorting: false
	}),
	colHelp.accessor('price_uom', {
		header: 'Unit Price',
		cell: ({ cell }) => {
			return renderSnippet(rightAlignSnippet, {
				value: numberFormatter.formatNumber(cell.getValue())
			});
		},
		enableSorting: false
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
		},
		enableSorting: true
	}),
	/* colHelp.accessor('pricePurchase', { header: 'Purchase' }), */
	colHelp.accessor('pricePurchase', {
		header: 'Purchase',
		cell: ({ cell }) => {
			return renderSnippet(rightAlignSnippet, {
				value: numberFormatter.formatNumber(cell.getValue())
			});
		}
	}),
	colHelp.accessor('ruc', {
		header: 'RuC',
		cell: ({ cell }) => {
			return renderSnippet(rightAlignSnippet, {
				value: numberFormatter.formatPercent(cell.getValue(), {
					minimumFractionDigits: 1,
					maximumFractionDigits: 1
				})
			});
		}
	}),
	colHelp.accessor('priceRetail', {
		header: 'Retail',
		cell: ({ row }) => {
			const priceRetail = row.original.priceRetail ?? 0;
			const priceMarketBest = row.original.priceMarketBest ?? 0;
			const qtyRetail = row.original.qtyRetail ?? 0;
			return renderSnippet(rightAlignSnippet, {
				value: numberFormatter.formatNumber(priceRetail),
				isDanger:
					priceMarketBest !== 0 &&
					qtyRetail > 0 &&
					(priceRetail - priceMarketBest) / priceMarketBest >= 0.05,
				action: row.original.action
			});
		}
	}),
	colHelp.accessor('priceVendorBest', {
		header: 'Vendors',
		cell: ({ row, cell }) => {
			return renderComponent(DataTableActionsVendor, {
				value:
					numberFormatter.formatNumber(cell.getValue(), {
						fractionDigits: 2
					}) ?? '',
				iscustomer: false,
				priceMarket: row.original.priceMarket
			});
		},
		enableSorting: false,
		enableHiding: true
	}),
	colHelp.accessor('priceMarketBest', {
		header: 'Market',
		cell: ({ row, cell }) => {
			const priceVendorBest = row.original.priceVendorBest ?? 0;
			const priceMarketBest = row.original.priceMarketBest ?? 0;
			// const qtyRetail = row.original.qtyRetail ?? 0;
			return renderComponent(DataTableActionsVendor, {
				value: numberFormatter.formatNumber(cell.getValue()) ?? '',
				iscustomer: true,
				priceMarket: row.original.priceMarket,
				isDanger:
					priceMarketBest !== 0 &&
					// qtyRetail > 0 &&
					priceMarketBest < priceVendorBest
			});
		},
		enableSorting: false,
		enableHiding: true
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
