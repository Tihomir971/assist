import type { Database, Tables } from '@tihomir971/assist-shared';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CRUDService } from '../base/crud.service';
import { TreeCollection } from '@zag-js/collection';
import { getRequestEvent, query } from '$app/server';
import { z } from 'zod';
import { getCategoryTree } from './category.service.remote';

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

type Category = Tables<'m_product_category'>; // Exported
// type CategoryWithLocalized = Category & { localized_name: string };

type CategoryCreate = Omit<Category, 'id' | 'created_at' | 'updated_at'>; // Exported
type CategoryUpdate = Partial<CategoryCreate>; // Exported
export type CategoryLookup = { value: number; label: string }; // Exported for lookup

/**
 * Interface for services that support localized tree structures
 */
interface LocalizedTreeService {
	getLookup(): Promise<Array<{ value: number; label: string }>>;
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
		const { locals } = getRequestEvent();
		// Automatically detect user's preferred locale and get dynamic default locale
		const fallbackLocale = locals.app.systemLocale;
		// const fallbackLocale = await getDefaultLocale(this.supabase);
		const preferredLocale = locals.app.userLocale || locals.app.systemLocale || 'en-US';
		console.log('Preferred Locale:', preferredLocale, 'Fallback Locale:', fallbackLocale);

		// Using inline COALESCE for better performance and type safety

		const data = await getRPCLookup(
			this.supabase,
			'm_product_category',
			'names',
			preferredLocale,
			fallbackLocale,
			{ searchTerm: undefined, filterActive: true }
		);
		return data || [];
	}
	getLookupAsync = query(z.string(), async (query: string): Promise<CategoryLookup[]> => {
		const { locals } = getRequestEvent();
		// Automatically detect user's preferred locale and get dynamic default locale
		const fallbackLocale = locals.app.systemLocale;
		// const fallbackLocale = await getDefaultLocale(this.supabase);
		const preferredLocale = locals.app.userLocale;
		console.log('Preferred Locale:', preferredLocale, 'Fallback Locale:', fallbackLocale);

		const data = await getRPCLookup(
			this.supabase,
			'm_product_category',
			'names',
			preferredLocale,
			fallbackLocale,
			{ searchTerm: query, filterActive: true }
		);
		console.log('Lookup Data:', JSON.stringify(data, null, 2));
		return data || [];
	});

	async getCategoryTreeCollection(): Promise<TreeCollection<TreeStructure>> {
		const treeData = await getCategoryTree();

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
