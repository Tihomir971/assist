import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import type { Database } from '$lib/types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

export const load: PageServerLoad = async ({ url, locals }) => {
	const warehouse = url.searchParams.get('warehouse');
	const treeCategory = url.searchParams.get('treeCategory');

	if (!warehouse || !treeCategory) {
		throw error(400, 'Warehouse and tree category parameters are required');
	}

	const supabase = locals.supabase as SupabaseClient<Database>;
	const subcategories = await findSubcategories(supabase, parseInt(treeCategory));
	const categoriesWithProducts = await findProductsGroupedByCategory(
		supabase,
		subcategories,
		warehouse
	);

	return {
		categoriesWithProducts
	};
};

interface Category {
	id: number;
	parent_id: number | null;
	name: string;
}

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

interface StockItem {
	m_product_id: number;
	qtyonhand: number;
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

async function findSubcategories(
	supabase: SupabaseClient<Database>,
	categoryId: number
): Promise<number[]> {
	const { data: categories, error: queryError } = await supabase
		.from('m_product_category')
		.select('id, parent_id, name');

	if (queryError) {
		throw error(500, 'Error fetching categories');
	}

	if (!categories) {
		return [categoryId];
	}

	function findChildren(parentId: number, allCategories: Category[]): number[] {
		const children = allCategories.filter((cat) => cat.parent_id === parentId).map((cat) => cat.id);
		const descendants = children.flatMap((childId) => findChildren(childId, allCategories));
		return [parentId, ...children, ...descendants];
	}

	const subcategories = findChildren(categoryId, categories);

	return [...new Set(subcategories)];
}

async function findProductsGroupedByCategory(
	supabase: SupabaseClient<Database>,
	categories: number[],
	warehouse: string
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

	products.forEach((product: Product) => {
		const stockQty = stockMap.get(product.id) || 0;
		if (stockQty > 0) {
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
