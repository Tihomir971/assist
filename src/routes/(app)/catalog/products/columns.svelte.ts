import { formatNumber } from '$lib/style/locale';
import { createRawSnippet } from 'svelte';
import DataTableActions from './data-table-actions.svelte';
import { createColumnHelper, renderComponent, renderSnippet } from '$lib/components/walker-tx';
import TableCheckbox from '$lib/components/walker-tx/table-checkbox.svelte';

export interface Warehouse {
	value: string;
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

type RawSnippetParams = {
	value: string | number | null;
	isDanger?: boolean;
};

const rightAlignSnippet = createRawSnippet<[RawSnippetParams]>((getValue) => {
	const { value, isDanger = false } = getValue();
	const className = isDanger ? 'text-right text-red-400' : 'text-right';

	return {
		render: () => `<div class="${className}">${value}</div>`,
		setup: (node) => {
			$effect(() => {
				const { value } = getValue();
				node.textContent = String(value);
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
	colHelp.accessor('sku', { header: 'SKU', enableHiding: false }),
	colHelp.accessor('mpn', { header: 'MPN' }),
	colHelp.accessor('name', { header: 'Name', enableHiding: false }),
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
		cell: ({ cell }) => {
			return renderSnippet(rightAlignSnippet, { value: cell.getValue() ?? '' });
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
					(priceRetail - priceCenoteka) / priceCenoteka >= 0.05
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

	colHelp.accessor('id', {
		header: '',
		cell: ({ row }) => {
			return renderComponent(DataTableActions, { id: row.original.id.toString() });
		},
		enableSorting: false,
		enableHiding: false
	})
];
