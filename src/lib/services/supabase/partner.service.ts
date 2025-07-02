import type { Database, Tables } from '@tihomir971/assist-shared';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CRUDService } from '../base/crud.service';

export type Partner = Tables<'c_bpartner'>;
export type PartnerCreate = Omit<Partner, 'id' | 'created_at' | 'updated_at'>;
export type PartnerUpdate = Partial<PartnerCreate>;
export type PartnerLookup = { value: number; label: string };

export class PartnerService implements CRUDService<Partner, PartnerCreate, PartnerUpdate> {
	constructor(private supabase: SupabaseClient<Database>) {}

	async getById(id: number): Promise<Partner | null> {
		const { data, error } = await this.supabase
			.from('c_bpartner')
			.select('*')
			.eq('id', id)
			.maybeSingle();

		if (error) throw new Error(`Failed to fetch partner: ${error.message}`);
		return data;
	}

	async create(data: PartnerCreate): Promise<Partner> {
		const { data: newPartner, error } = await this.supabase
			.from('c_bpartner')
			.insert(data)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to create partner: ${error.message}`);
		if (!newPartner) throw new Error('Failed to create partner: No data returned');
		return newPartner;
	}

	async update(id: number, data: PartnerUpdate): Promise<Partner> {
		const { data: updatedPartner, error } = await this.supabase
			.from('c_bpartner')
			.update(data)
			.eq('id', id)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to update partner: ${error.message}`);
		if (!updatedPartner) throw new Error('Failed to update partner: No data returned');
		return updatedPartner;
	}

	async delete(id: number): Promise<void> {
		const { error } = await this.supabase.from('c_bpartner').delete().eq('id', id);
		if (error) throw new Error(`Failed to delete partner: ${error.message}`);
	}

	async list(filters?: Record<string, unknown>): Promise<Partner[]> {
		let query = this.supabase.from('c_bpartner').select('*');

		if (filters?.is_active !== undefined) {
			query = query.eq('is_active', filters.is_active as boolean);
		}
		if (filters?.iscustomer !== undefined) {
			query = query.eq('iscustomer', filters.iscustomer as boolean);
		}
		if (filters?.isvendor !== undefined) {
			query = query.eq('isvendor', filters.isvendor as boolean);
		}

		const { data, error } = await query.order('display_name');
		if (error) throw new Error(`Failed to list partners: ${error.message}`);
		return data || [];
	}

	async getLookup(filters?: { isvendor?: boolean }): Promise<PartnerLookup[]> {
		let query = this.supabase
			.from('c_bpartner')
			.select('value:id, label:display_name')
			.eq('is_active', true);

		if (filters?.isvendor) {
			query = query.eq('isvendor', true);
		}

		const { data, error } = await query.order('display_name');

		if (error) throw new Error(`Failed to load partner lookup: ${error.message}`);
		return data || [];
	}
}
