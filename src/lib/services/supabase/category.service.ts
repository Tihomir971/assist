import type { Database, Tables } from '$lib/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CRUDService } from '../base/crud.service';
import { TreeCollection } from '@zag-js/collection';
import { getCurrentUserLocale, getDefaultLocale } from '$lib/utils/locale.utils';

export async function getRPCLookup(
	supabase: SupabaseClient<Database>,
	tableName: string,
	labelColumn: string,
	preferredLocale: string,
	fallbackLocale: string = 'en-US',
	options: {
		searchTerm?: string;
		filterActive?: boolean;
		extraColumn?: string;
	} = {}
): Promise<(CategoryLookup & { [key: string]: string | number | null })[] | null> {
	const { searchTerm, filterActive = true, extraColumn } = options;

	const { data, error } = await supabase.rpc('get_localized_lookup', {
		table_name: tableName,
		label_column_name: labelColumn,
		preferred_locale: preferredLocale,
		fallback_locale: fallbackLocale,
		search_term: searchTerm,
		filter_active: filterActive,
		extra_column_name: extraColumn // Pass the column name to the RPC
	});

	if (error) {
		console.error(`Error fetching options for table "${tableName}":`, error);
		return null;
	}

	// If an extra column was requested, we need to rename 'extra_data' to the dynamic key.
	if (extraColumn && data) {
		return data.map(({ value, label, extra_data }) => ({
			value,
			label,
			[extraColumn]: extra_data
		}));
	}

	return data;
}

export type Category = Tables<'m_product_category'>; // Exported
// type CategoryWithLocalized = Category & { localized_name: string };

export type CategoryCreate = Omit<Category, 'id' | 'created_at' | 'updated_at'>; // Exported
export type CategoryUpdate = Partial<CategoryCreate>; // Exported
export type CategoryLookup = { value: number; label: string }; // Exported for lookup

/**
 * Interface for services that support localized tree structures
 */
export interface LocalizedTreeService {
	getLookup(): Promise<Array<{ value: number; label: string }>>;
	getCategoryTree(): Promise<Array<{ value: number; label: string; parent_id?: number }>>;
}

export class CategoryService
	implements CRUDService<Category, CategoryCreate, CategoryUpdate>, LocalizedTreeService
{
	constructor(private supabase: SupabaseClient<Database>) {}

	async getById(id: number): Promise<Category | null> {
		const { data, error } = await this.supabase
			.from('m_product_category')
			.select(`*`)
			.eq('id', id)
			.maybeSingle();

		if (error) throw new Error(`Failed to fetch category: ${error.message}`);
		return data;
	}

	async create(data: CategoryCreate): Promise<Category> {
		const { data: newCategory, error } = await this.supabase
			.from('m_product_category')
			.insert(data)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to create category: ${error.message}`);
		if (!newCategory) throw new Error('Failed to create category: No data returned'); // Added null check
		return newCategory;
	}

	async update(id: number, data: CategoryUpdate): Promise<Category> {
		const { data: updatedCategory, error } = await this.supabase
			.from('m_product_category')
			.update(data)
			.eq('id', id)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to update category: ${error.message}`);
		if (!updatedCategory) throw new Error('Failed to update category: No data returned'); // Added null check
		return updatedCategory;
	}

	async delete(id: number): Promise<void> {
		const { error } = await this.supabase.from('m_product_category').delete().eq('id', id);

		if (error) throw new Error(`Failed to delete category: ${error.message}`);
	}

	async list(filters?: Record<string, unknown>): Promise<Category[]> {
		// Changed any to unknown
		let query = this.supabase.from('m_product_category').select('*');

		if (filters?.is_active !== undefined) {
			query = query.eq('is_active', filters.is_active as boolean); // Added type assertion
		}

		const { data, error } = await query.order('name');
		if (error) throw new Error(`Failed to list categories: ${error.message}`);
		return data || [];
	}

	// Category-specific methods
	async getCategoryWithRelatedData(id: number) {
		// Corrected to call instance methods for price rules and channel mappings
		const [category, channelMappings] = await Promise.all([
			this.getById(id),
			this.getChannelMappings(id)
		]);

		return {
			category,
			channelMappings
		};
	}

	private async getChannelMappings(categoryId: number) {
		const { data, error } = await this.supabase
			.from('c_channel_map_category')
			.select('*')
			.eq('m_product_category_id', categoryId);

		if (error)
			throw new Error(
				`Failed to fetch channel mappings for category ${categoryId}: ${error.message}`
			);
		return data || [];
	}

	async getLookup(): Promise<CategoryLookup[]> {
		// Automatically detect user's preferred locale and get dynamic default locale
		const [preferredLocale, fallbackLocale] = await Promise.all([
			getCurrentUserLocale(this.supabase),
			getDefaultLocale(this.supabase)
		]);
		console.log('Preferred Locale:', preferredLocale, 'Fallback Locale:', fallbackLocale);

		// Using inline COALESCE for better performance and type safety

		const data = await getRPCLookup(
			this.supabase,
			'm_product_category',
			'names',
			preferredLocale,
			fallbackLocale
		);
		console.log('Lookup Data:', JSON.stringify(data, null, 2));
		return data || [];
	}

	async getCategoryTree(): Promise<TreeStructure[]> {
		// Automatically detect user's preferred locale and get dynamic default locale
		const [preferredLocale, fallbackLocale] = await Promise.all([
			getCurrentUserLocale(this.supabase),
			getDefaultLocale(this.supabase)
		]);

		const data = await getRPCLookup(
			this.supabase,
			'm_product_category',
			'names',
			preferredLocale,
			fallbackLocale,
			{ extraColumn: 'parent_id' }
		);

		const items = data || [];
		if (!items.length) return [];

		const itemMap = new Map<number, TreeStructure>();
		const orphanedNodes: TreeStructure[] = [];

		// Transform data with client-side localization (optimized)
		const transformedItems = items.map((item) => ({
			value: item.value,
			label: item.label,
			parent_id: item.parent_id ? Number(item.parent_id) : null
		}));

		// Initialize the map with items, preparing the basic structure
		transformedItems.forEach((item) => {
			// Create Output object, ensuring children array is initialized
			itemMap.set(item.value, { value: item.value, label: item.label, children: [] });
		});

		const result: TreeStructure[] = [];

		// Build tree structure and collect orphaned nodes
		transformedItems.forEach((item) => {
			const currentItem = itemMap.get(item.value)!; // Non-null assertion is safe due to initialization loop

			if (item.parent_id === null) {
				// Root item
				result.push(currentItem);
			} else {
				const parent = itemMap.get(item.parent_id);
				if (parent) {
					// Parent found, add current item to parent's children
					parent.children!.push(currentItem);
				} else {
					// Parent not found - this is an orphaned node
					// Add it to orphaned nodes collection for potential recovery
					console.warn(
						`Category ${item.value} (${item.label}) has missing parent_id: ${item.parent_id}`
					);
					orphanedNodes.push(currentItem);
				}
			}
		});

		// Add orphaned nodes to root level to prevent data loss
		// This ensures all nodes are visible even if their parent relationships are broken
		if (orphanedNodes.length > 0) {
			console.warn(
				`Found ${orphanedNodes.length} orphaned category nodes, adding them to root level`
			);
			result.push(...orphanedNodes);
		}

		// Clean up: remove empty children arrays
		itemMap.forEach((item) => {
			if (item.children && item.children.length === 0) {
				delete item.children;
			}
		});

		return result;
	}

	async getCategoryTreeCollection(): Promise<TreeCollection<TreeStructure>> {
		const treeData = await this.getCategoryTree();

		return new TreeCollection<TreeStructure>({
			rootNode: {
				value: 0,
				label: 'Root',
				children: treeData
			} as TreeStructure,
			nodeToValue: (node) => node.value.toString(),
			nodeToString: (node) => node.label,
			nodeToChildren: (node) => node.children || []
		});
	}
}

export interface TreeStructure {
	value: number;
	label: string;
	children?: TreeStructure[];
}
