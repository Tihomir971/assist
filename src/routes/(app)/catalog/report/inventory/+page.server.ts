import { error } from '@sveltejs/kit';
import { findChildren } from '$lib/scripts/tree';
import { z } from 'zod';
import type { PageServerLoad } from './$types';

const searchParamsSchema = z.object({
	warehouse: z.number().min(1, 'Warehouse is required'),
	treeCategory: z.number().min(1, 'Category is required'),
	includeOutOfStock: z
		.boolean()
		.transform((val) => val === true)
		.default(false)
});

export const load: PageServerLoad = async ({ url, locals: { supabase } }) => {
	const params = searchParamsSchema.safeParse({
		warehouse: url.searchParams.get('warehouse'),
		treeCategory: url.searchParams.get('treeCategory'),
		includeOutOfStock: url.searchParams.get('includeOutOfStock')
	});

	if (!params.success) {
		throw error(400, params.error.errors.map((e) => e.message).join(', '));
	}

	const { warehouse, treeCategory, includeOutOfStock } = params.data;

	const { data: categories } = await supabase
		.from('m_product_category')
		.select('id,parent_id, title:name')
		.order('name');

	async function findProductsGroupedByCategory(
		categories: number[],
		warehouse: number,
		includeOutOfStock: boolean
	): Promise<CategoryWithProducts[]> {
		const { data: products, error: productsError } = await supabase
			.from('m_product')
			.select(
				`
					id,
					name,
					sku,
					m_product_category_id,
					m_product_category!inner (
						id,
						name
					)
				`
			)
			.in('m_product_category_id', categories);

		if (productsError) {
			throw error(500, 'Error fetching products');
		}

		const { data: stock, error: stockError } = await supabase
			.from('m_storageonhand')
			.select('m_product_id, qtyonhand')
			.in(
				'm_product_id',
				products.map((p) => p.id)
			)
			.eq('warehouse_id', warehouse);

		if (stockError) {
			throw error(500, 'Error fetching stock information');
		}

		const { data: gtins, error: gtinError } = await supabase
			.from('m_product_gtin')
			.select('m_product_id, gtin')
			.in(
				'm_product_id',
				products.map((p) => p.id)
			);

		if (gtinError) {
			throw error(500, 'Error fetching GTIN information');
		}

		const stockMap = new Map(stock.map((s) => [s.m_product_id, s.qtyonhand]));
		const gtinMap = new Map<number, string[]>();
		gtins.forEach((g) => {
			if (!gtinMap.has(g.m_product_id)) {
				gtinMap.set(g.m_product_id, []);
			}
			gtinMap.get(g.m_product_id)!.push(g.gtin);
		});

		const groupedProducts = new Map<number, CategoryWithProducts>();

		// Type assertion to handle the known inner join guarantee
		(products as Product[]).forEach((product) => {
			const stockQty = stockMap.get(product.id) || 0;
			if (includeOutOfStock || stockQty > 0) {
				const category = product.m_product_category;
				if (!groupedProducts.has(category.id)) {
					groupedProducts.set(category.id, {
						id: category.id,
						name: category.name,
						products: []
					});
				}
				groupedProducts.get(category.id)!.products.push({
					sku: product.sku,
					name: product.name,
					stock: stockQty,
					barcodes: gtinMap.get(product.id) || []
				});
			}
		});

		// Sort products by name within each category
		groupedProducts.forEach((category) => {
			category.products.sort((a, b) => a.name.localeCompare(b.name));
		});

		return Array.from(groupedProducts.values());
	}
	if (!categories) {
		throw error(400, 'No categories found');
	}
	const subcategories = findChildren(categories, treeCategory);
	const categoriesWithProducts = await findProductsGroupedByCategory(
		subcategories,
		warehouse,
		includeOutOfStock
	);
	const { data: parentCategory } = await supabase
		.from('m_product_category')
		.select('name')
		.eq('id', treeCategory)
		.single();

	return {
		parentCategory,
		categoriesWithProducts
	};
};

interface Product {
	id: number;
	name: string;
	sku: string | null;
	m_product_category_id: number | null;
	m_product_category: {
		id: number;
		name: string;
	};
}

interface GroupedProduct {
	sku: string | null;
	name: string;
	stock: number;
	barcodes: string[];
}

interface CategoryWithProducts {
	id: number;
	name: string;
	products: GroupedProduct[];
}
