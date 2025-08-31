import type { Database, Tables } from '$lib/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CRUDService } from '../base/crud.service';

export type ProductAttributeOption = Tables<'m_product_attribute_option'>;
export type ProductAttributeOptionCreate = Omit<
	ProductAttributeOption,
	'id' | 'created_at' | 'updated_at'
>;
export type ProductAttributeOptionUpdate = Partial<ProductAttributeOptionCreate>;

export class ProductAttributeOptionService
	implements
		CRUDService<ProductAttributeOption, ProductAttributeOptionCreate, ProductAttributeOptionUpdate>
{
	constructor(private supabase: SupabaseClient<Database>) {}

	async getById(id: number): Promise<ProductAttributeOption | null> {
		const { data, error } = await this.supabase
			.from('m_product_attribute_option')
			.select('*')
			.eq('id', id)
			.maybeSingle();

		if (error) throw new Error(`Failed to fetch product attribute option: ${error.message}`);
		return data;
	}

	async create(data: ProductAttributeOptionCreate): Promise<ProductAttributeOption> {
		const { data: newRecord, error } = await this.supabase
			.from('m_product_attribute_option')
			.insert(data)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to create product attribute option: ${error.message}`);
		if (!newRecord) throw new Error('Failed to create product attribute option: No data returned');
		return newRecord;
	}

	async update(id: number, data: ProductAttributeOptionUpdate): Promise<ProductAttributeOption> {
		const { data: updatedRecord, error } = await this.supabase
			.from('m_product_attribute_option')
			.update(data)
			.eq('id', id)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to update product attribute option: ${error.message}`);
		if (!updatedRecord)
			throw new Error('Failed to update product attribute option: No data returned');
		return updatedRecord;
	}

	async createMultiple(records: ProductAttributeOptionCreate[]): Promise<ProductAttributeOption[]> {
		const { data, error } = await this.supabase
			.from('m_product_attribute_option')
			.insert(records)
			.select('*');

		if (error)
			throw new Error(`Failed to create multiple product attribute options: ${error.message}`);
		return data || [];
	}

	async delete(id: number): Promise<void> {
		const { error } = await this.supabase.from('m_product_attribute_option').delete().eq('id', id);
		if (error) throw new Error(`Failed to delete product attribute option: ${error.message}`);
	}

	async deleteByProductAndAttribute(productId: number, attributeId: number): Promise<void> {
		const { error } = await this.supabase
			.from('m_product_attribute_option')
			.delete()
			.eq('product_id', productId)
			.eq('attribute_id', attributeId);

		if (error) {
			throw new Error(`Failed to delete product attribute options: ${error.message}`);
		}
	}

	async list(filters?: Record<string, unknown>): Promise<ProductAttributeOption[]> {
		let query = this.supabase.from('m_product_attribute_option').select('*');

		if (filters?.product_id) {
			query = query.eq('product_id', filters.product_id as number);
		}
		if (filters?.attribute_id) {
			query = query.eq('attribute_id', filters.attribute_id as number);
		}

		const { data, error } = await query;
		if (error) throw new Error(`Failed to list product attribute options: ${error.message}`);
		return data || [];
	}

	async getByProductId(productId: number): Promise<ProductAttributeOption[]> {
		const { data, error } = await this.supabase
			.from('m_product_attribute_option')
			.select('*')
			.eq('product_id', productId);

		if (error) throw new Error(`Failed to fetch product attribute options: ${error.message}`);
		return data || [];
	}

	async upsertMultipleOptions(
		productId: number,
		attributeId: number,
		optionIds: number[]
	): Promise<ProductAttributeOption[]> {
		const existingOptions = await this.list({
			product_id: productId,
			attribute_id: attributeId
		});
		const existingOptionIds = new Set(existingOptions.map((o) => o.option_id));
		const newOptionIds = new Set(optionIds);

		const optionsToDelete = existingOptions
			.filter((o) => !newOptionIds.has(o.option_id))
			.map((o) => o.id);

		const optionsToInsert = optionIds
			.filter((id) => !existingOptionIds.has(id))
			.map(
				(optionId) =>
					({
						product_id: productId,
						attribute_id: attributeId,
						option_id: optionId,
						is_active: true
					}) as ProductAttributeOptionCreate
			);

		if (optionsToDelete.length > 0) {
			const { error } = await this.supabase
				.from('m_product_attribute_option')
				.delete()
				.in('id', optionsToDelete);
			if (error) throw new Error(`Failed to delete product attribute options: ${error.message}`);
		}

		let inserted: ProductAttributeOption[] = [];
		if (optionsToInsert.length > 0) {
			inserted = await this.createMultiple(optionsToInsert);
		}

		const finalOptions = existingOptions
			.filter((o) => newOptionIds.has(o.option_id))
			.concat(inserted);

		return finalOptions;
	}
}
