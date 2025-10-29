import DataTableActions from './data-table-actions.svelte';
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
import { type ColumnDef } from '@tanstack/table-core';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';
import { Checkbox } from '$lib/components/ark/checkbox';

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

export const columnDefs: ColumnDef<FlattenedProduct>[] = [
	{
		id: 'select',
		header: ({ table }) =>
			renderComponent(Checkbox, {
				checked:
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && 'indeterminate'),
				onCheckedChange: () => {
					table.toggleAllRowsSelected();
				}
			}),
		cell: ({ row }) =>
			renderComponent(Checkbox, {
				checked: row.getIsSelected(),
				onCheckedChange: () => {
					row.toggleSelected();
				}
			}),
		enableSorting: false,
		enableHiding: false
	},
	{
		accessorKey: 'sku',
		header: 'SKU',
		enableSorting: true,
		enableHiding: false,
		meta: { filterType: 'text' }
	},
	{ accessorKey: 'brand', header: 'Brand' },
	{ accessorKey: 'mpn', header: 'MPN' },
	{
		accessorKey: 'name',
		header: 'Tax',
		// header: ({ column }) => renderSnippet(sortColumnHeader, { column, title: 'Name' }),
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
	},
	{
		accessorKey: 'taxRate',
		header: 'Tax',
		cell: ({ row }) => {
			return renderSnippet(rightAlignSnippet, {
				value: numberFormatter.formatPercent(row.original.taxRate, {
					fractionDigits: 0
				})
			});
		},
		enableSorting: false
	},
	{
		accessorKey: 'unitsperpack',
		header: 'Pack',
		cell: ({ row }) => {
			return renderSnippet(rightAlignSnippet, { value: row.original.taxRate });
		},
		enableSorting: false
	},
	{
		accessorKey: 'price_uom',
		header: 'Unit Price',
		cell: ({ row }) => {
			return renderSnippet(rightAlignSnippet, {
				value: numberFormatter.formatNumber(row.original.price_uom)
			});
		},
		enableSorting: false
	},
	{
		accessorKey: 'qtyWholesale',
		header: 'WH',
		cell: ({ row }) => {
			return renderSnippet(rightAlignSnippet, { value: row.original.qtyWholesale });
		}
	},
	{
		accessorKey: 'qtyRetail',
		header: 'RT',
		cell: ({ row }) => {
			return renderSnippet(rightAlignSnippet, { value: row.original.qtyRetail });
		}
	},
	{
		accessorKey: 'levelMin',
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
	},
	{
		accessorKey: 'levelMax',
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
	},
	{
		accessorKey: 'pricePurchase',
		header: 'Purchase',
		cell: ({ row }) => {
			return renderSnippet(rightAlignSnippet, {
				value: numberFormatter.formatNumber(row.original.pricePurchase)
			});
		}
	},
	{
		accessorKey: 'ruc',
		header: 'RuC',
		cell: ({ row }) => {
			return renderSnippet(rightAlignSnippet, {
				value: numberFormatter.formatPercent(row.original.ruc, {
					minimumFractionDigits: 1,
					maximumFractionDigits: 1
				})
			});
		}
	},
	{
		accessorKey: 'priceRetail',
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
	},
	{
		accessorKey: 'priceVendorBest',
		header: 'Vendors',
		cell: ({ row }) => {
			return renderComponent(DataTableActionsVendor, {
				value:
					numberFormatter.formatNumber(row.original.priceVendorBest, {
						fractionDigits: 2
					}) ?? '',
				iscustomer: false,
				priceMarket: row.original.priceMarket
			});
		},
		enableSorting: false,
		enableHiding: true
	},
	{
		accessorKey: 'priceMarketBest',
		header: 'Market',
		cell: ({ row }) => {
			const priceVendorBest = row.original.priceVendorBest ?? 0;
			const priceMarketBest = row.original.priceMarketBest ?? 0;
			// const qtyRetail = row.original.qtyRetail ?? 0;
			return renderComponent(DataTableActionsVendor, {
				value: numberFormatter.formatNumber(row.original.priceMarketBest) ?? '',
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
	},
	{
		accessorKey: 'id',
		header: '',
		cell: ({ row }) => {
			return renderComponent(DataTableActions, { id: row.original.id.toString() });
		},
		enableSorting: false,
		enableHiding: false
	}
];

// export const customColumns = genericColumns(defaultColumns);
