import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Tables } from '$lib/types/supabase';

import { docTemplateInsertSchema, docTemplateUpdateSchema } from '$lib/types/supabase.zod.schemas';
import type { z } from 'zod';
import type { ContextSchemaStructure } from '$lib/types/supabase.zod.schemas';

type DocTemplate = Tables<'doc_template'>;
type DocTemplateInsert = z.infer<typeof docTemplateInsertSchema>;
type DocTemplateUpdate = z.infer<typeof docTemplateUpdateSchema>;
export type DocTemplateLookup = { value: number; label: string };
export type DocTemplateLookupWithSchema = {
	value: number;
	label: string;
	context_schema: ContextSchemaStructure | null;
};

export class DocTemplateService {
	constructor(public supabase: SupabaseClient<Database>) {}

	async getById(id: number): Promise<DocTemplate | null> {
		const { data, error } = await this.supabase
			.from('doc_template')
			.select('*')
			.eq('id', id)
			.maybeSingle();

		if (error) {
			console.error(`Error fetching document template by id: ${id}`, error);
			throw new Error('Failed to fetch document template.');
		}
		return data;
	}

	async create(template: DocTemplateInsert): Promise<DocTemplate> {
		const { data, error } = await this.supabase
			.from('doc_template')
			.insert(template)
			.select()
			.single();

		if (error) {
			console.error('Error creating document template:', error);
			throw new Error('Failed to create document template.');
		}
		return data;
	}

	async update(id: number, template: DocTemplateUpdate): Promise<DocTemplate> {
		const { data, error } = await this.supabase
			.from('doc_template')
			.update(template)
			.eq('id', id)
			.select()
			.single();

		if (error) {
			console.error(`Error updating document template by id: ${id}`, error);
			throw new Error('Failed to update document template.');
		}
		return data;
	}

	async list(): Promise<DocTemplate[]> {
		const { data, error } = await this.supabase.from('doc_template').select('*');
		if (error) {
			console.error('Error listing document templates:', error);
			throw new Error('Failed to list document templates.');
		}
		return data || [];
	}

	async delete(id: number): Promise<void> {
		const { error } = await this.supabase.from('doc_template').delete().eq('id', id);

		if (error) {
			console.error('Error deleting document template:', error);
			throw error;
		}
	}

	async getLookup(): Promise<DocTemplateLookup[]> {
		const { data, error } = await this.supabase
			.from('doc_template')
			.select('value:id, label:name')
			.eq('is_active', true)
			.order('name');

		if (error) {
			console.error('Failed to load doc template lookup:', error);
			throw new Error('Failed to load doc template lookup.');
		}
		return data || [];
	}

	async getLookupWithSchema(): Promise<DocTemplateLookupWithSchema[]> {
		const { data, error } = await this.supabase
			.from('doc_template')
			.select('value:id, label:name, context_schema')
			.eq('is_active', true)
			.order('name');

		if (error) {
			console.error('Failed to load doc template lookup with schema:', error);
			throw new Error('Failed to load doc template lookup with schema.');
		}

		// Transform the data to match our type expectations
		return (data || []).map((item) => ({
			value: item.value,
			label: item.label,
			context_schema: item.context_schema as ContextSchemaStructure | null
		}));
	}

	async getTemplateWithSchema(id: number): Promise<DocTemplate | null> {
		const { data, error } = await this.supabase
			.from('doc_template')
			.select('*')
			.eq('id', id)
			.eq('is_active', true)
			.maybeSingle();

		if (error) {
			console.error(`Error fetching template with schema by id: ${id}`, error);
			throw new Error('Failed to fetch template with schema.');
		}
		return data;
	}
}
