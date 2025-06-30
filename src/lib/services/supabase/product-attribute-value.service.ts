import type { Database, Tables } from '$lib/types/supabase.types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CRUDService } from '../base/crud.service';

export type ProductAttributeValue = Tables<'m_product_attribute_value'>;
export type ProductAttributeValueCreate = Omit<
	ProductAttributeValue,
	'id' | 'created_at' | 'updated_at'
>;
export type ProductAttributeValueUpdate = Partial<ProductAttributeValueCreate>;

export class ProductAttributeValueService
	implements
		CRUDService<ProductAttributeValue, ProductAttributeValueCreate, ProductAttributeValueUpdate>
{
	constructor(private supabase: SupabaseClient<Database>) {}

	async getById(id: number): Promise<ProductAttributeValue | null> {
		const { data, error } = await this.supabase
			.from('m_product_attribute_value')
			.select('*')
			.eq('id', id)
			.maybeSingle();

		if (error) throw new Error(`Failed to fetch product attribute value: ${error.message}`);
		return data;
	}

	async create(data: ProductAttributeValueCreate): Promise<ProductAttributeValue> {
		const { data: newRecord, error } = await this.supabase
			.from('m_product_attribute_value')
			.insert(data)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to create product attribute value: ${error.message}`);
		if (!newRecord) throw new Error('Failed to create product attribute value: No data returned');
		return newRecord;
	}

	async update(id: number, data: ProductAttributeValueUpdate): Promise<ProductAttributeValue> {
		const { data: updatedRecord, error } = await this.supabase
			.from('m_product_attribute_value')
			.update(data)
			.eq('id', id)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to update product attribute value: ${error.message}`);
		if (!updatedRecord)
			throw new Error('Failed to update product attribute value: No data returned');
		return updatedRecord;
	}

	async delete(id: number): Promise<void> {
		const { error } = await this.supabase.from('m_product_attribute_value').delete().eq('id', id);
		if (error) throw new Error(`Failed to delete product attribute value: ${error.message}`);
	}

	async list(filters?: Record<string, unknown>): Promise<ProductAttributeValue[]> {
		let query = this.supabase.from('m_product_attribute_value').select('*');

		if (filters?.product_id) {
			query = query.eq('product_id', filters.product_id as number);
		}
		if (filters?.attribute_id) {
			query = query.eq('attribute_id', filters.attribute_id as number);
		}

		const { data, error } = await query;
		if (error) throw new Error(`Failed to list product attribute values: ${error.message}`);
		return data || [];
	}

	async getByProductId(productId: number): Promise<ProductAttributeValue[]> {
		const { data, error } = await this.supabase
			.from('m_product_attribute_value')
			.select('*')
			.eq('product_id', productId);

		if (error) throw new Error(`Failed to fetch product attribute values: ${error.message}`);
		return data || [];
	}
}
