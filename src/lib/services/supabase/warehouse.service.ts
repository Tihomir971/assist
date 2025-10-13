import type { Database, Tables } from '@tihomir971/assist-shared';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CRUDService } from '../base/crud.service';

type Warehouse = Tables<'m_warehouse'>;
type WarehouseCreate = Omit<Warehouse, 'id' | 'created_at' | 'updated_at'>;
type WarehouseUpdate = Partial<WarehouseCreate>;
type WarehouseLookup = { value: number; label: string };

export class WarehouseService implements CRUDService<Warehouse, WarehouseCreate, WarehouseUpdate> {
	constructor(private supabase: SupabaseClient<Database>) {}

	async getById(id: number): Promise<Warehouse | null> {
		const { data, error } = await this.supabase
			.from('m_warehouse')
			.select('*')
			.eq('id', id)
			.maybeSingle();

		if (error) throw new Error(`Failed to fetch warehouse: ${error.message}`);
		return data;
	}

	async create(data: WarehouseCreate): Promise<Warehouse> {
		const { data: newWarehouse, error } = await this.supabase
			.from('m_warehouse')
			.insert(data)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to create warehouse: ${error.message}`);
		if (!newWarehouse) throw new Error('Failed to create warehouse: No data returned');
		return newWarehouse;
	}

	async update(id: number, data: WarehouseUpdate): Promise<Warehouse> {
		const { data: updatedWarehouse, error } = await this.supabase
			.from('m_warehouse')
			.update(data)
			.eq('id', id)
			.select('*')
			.single();

		if (error) throw new Error(`Failed to update warehouse: ${error.message}`);
		if (!updatedWarehouse) throw new Error('Failed to update warehouse: No data returned');
		return updatedWarehouse;
	}

	async delete(id: number): Promise<void> {
		const { error } = await this.supabase.from('m_warehouse').delete().eq('id', id);
		if (error) throw new Error(`Failed to delete warehouse: ${error.message}`);
	}

	async list(filters?: Record<string, unknown>): Promise<Warehouse[]> {
		let query = this.supabase.from('m_warehouse').select('*');

		if (filters?.is_active !== undefined) {
			query = query.eq('is_active', filters.is_active as boolean);
		}

		const { data, error } = await query.order('name');
		if (error) throw new Error(`Failed to list warehouses: ${error.message}`);
		return data || [];
	}

	async getLookup(): Promise<WarehouseLookup[]> {
		const { data, error } = await this.supabase
			.from('m_warehouse')
			.select('value:id, label:name')
			.eq('is_active', true)
			.order('name');

		if (error) throw new Error(`Failed to load warehouse lookup: ${error.message}`);
		return data || [];
	}
}
