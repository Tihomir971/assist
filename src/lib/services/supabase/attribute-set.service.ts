import type { Database, Tables } from '$lib/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CRUDService } from '../base/crud.service';

export type AttributeSet = Tables<'m_attributeset'>;
export type AttributeSetCreate = Omit<AttributeSet, 'id' | 'created_at' | 'updated_at'>;
export type AttributeSetUpdate = Partial<AttributeSetCreate>;
export type AttributeSetLookup = { value: number; label: string };

export class AttributeSetService
	implements CRUDService<AttributeSet, AttributeSetCreate, AttributeSetUpdate>
{
	constructor(private supabase: SupabaseClient<Database>) {}

	async getById(id: number): Promise<AttributeSet | null> {
		const { data, error } = await this.supabase
			.from('m_attributeset')
			.select('*')
			.eq('id', id)
			.maybeSingle();

		if (error) throw new Error(`Failed to fetch attribute set: ${error.message}`);
		return data;
	}

	async create(data: AttributeSetCreate): Promise<AttributeSet> {
		const { data: newAttributeSet, error } = await this.supabase
			.from('m_attributeset')
			.insert(data)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to create attribute set: ${error.message}`);
		if (!newAttributeSet) throw new Error('Failed to create attribute set: No data returned');
		return newAttributeSet;
	}

	async update(id: number, data: AttributeSetUpdate): Promise<AttributeSet> {
		const { data: updatedAttributeSet, error } = await this.supabase
			.from('m_attributeset')
			.update(data)
			.eq('id', id)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to update attribute set: ${error.message}`);
		if (!updatedAttributeSet) throw new Error('Failed to update attribute set: No data returned');
		return updatedAttributeSet;
	}

	async delete(id: number): Promise<void> {
		// Check if the attribute set is used by any products
		const { data: usedByProducts, error: checkProductsError } = await this.supabase
			.from('m_product')
			.select('id')
			.eq('attributeset_id', id)
			.limit(1);

		if (checkProductsError) {
			throw new Error(`Failed to check if attribute set is in use: ${checkProductsError.message}`);
		}

		if (usedByProducts && usedByProducts.length > 0) {
			throw new Error('Cannot delete attribute set that is in use by products');
		}

		// Check if the attribute set has any attributes and delete them
		const { data: hasAttributes, error: checkAttributesError } = await this.supabase
			.from('m_attributeset_attribute')
			.select('id')
			.eq('attributeset_id', id)
			.limit(1);

		if (checkAttributesError) {
			throw new Error(
				`Failed to check if attribute set has attributes: ${checkAttributesError.message}`
			);
		}

		if (hasAttributes && hasAttributes.length > 0) {
			const { error: deleteAttributesError } = await this.supabase
				.from('m_attributeset_attribute')
				.delete()
				.eq('attributeset_id', id);

			if (deleteAttributesError) {
				throw new Error(
					`Failed to delete attribute set attributes: ${deleteAttributesError.message}`
				);
			}
		}

		const { error } = await this.supabase.from('m_attributeset').delete().eq('id', id);
		if (error) throw new Error(`Failed to delete attribute set: ${error.message}`);
	}

	async list(filters?: Record<string, unknown>): Promise<AttributeSet[]> {
		let query = this.supabase.from('m_attributeset').select('*');

		if (filters?.is_active !== undefined) {
			query = query.eq('is_active', filters.is_active as boolean);
		}

		const { data, error } = await query.order('name');
		if (error) throw new Error(`Failed to list attribute sets: ${error.message}`);
		return data || [];
	}

	async getLookup(): Promise<AttributeSetLookup[]> {
		const { data, error } = await this.supabase
			.from('m_attributeset')
			.select('value:id, label:name')
			.eq('is_active', true)
			.order('name');

		if (error) throw new Error(`Failed to load attribute set lookup: ${error.message}`);
		return data || [];
	}
}
