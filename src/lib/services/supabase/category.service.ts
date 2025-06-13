import type { Database, Tables } from '$lib/types/supabase.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CRUDService } from '../base/crud.service'; // Removed ServiceResult as it's not directly used here

export type Category = Tables<'m_product_category'>; // Exported
export type CategoryCreate = Omit<Category, 'id' | 'created_at' | 'updated_at'>; // Exported
export type CategoryUpdate = Partial<CategoryCreate>; // Exported
export type CategoryLookup = { value: number; label: string }; // Exported for lookup

export class CategoryService implements CRUDService<Category, CategoryCreate, CategoryUpdate> {
	constructor(private supabase: SupabaseClient<Database>) {}

	async getById(id: number): Promise<Category | null> {
		const { data, error } = await this.supabase
			.from('m_product_category')
			.select('*')
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
		const [category, priceRules, channelMappings] = await Promise.all([
			this.getById(id),
			this.getPriceRules(id),
			this.getChannelMappings(id)
		]);

		return {
			category,
			priceRules,
			channelMappings
		};
	}

	private async getPriceRules(categoryId: number) {
		const { data, error } = await this.supabase
			.from('price_rules')
			.select('*')
			.eq('m_product_category_id', categoryId);

		if (error)
			throw new Error(`Failed to fetch price rules for category ${categoryId}: ${error.message}`);
		return data || [];
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

	async getCategoryLookup(): Promise<CategoryLookup[]> {
		const { data, error } = await this.supabase
			.from('m_product_category')
			.select('value:id, label:name')
			.order('name');

		if (error) throw new Error(`Failed to load category lookup: ${error.message}`);
		return data || [];
	}
}
