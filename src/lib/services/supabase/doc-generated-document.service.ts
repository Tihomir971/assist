import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Tables } from '$lib/types/supabase';
import type {
	docGeneratedDocumentInsertSchema,
	docGeneratedDocumentUpdateSchema
} from '$lib/types/supabase.zod.schemas';
import type { z } from 'zod';

export type DocGeneratedDocument = Tables<'doc_generated_document'>;
export type DocGeneratedDocumentWithTemplate = DocGeneratedDocument & {
	doc_template: Tables<'doc_template'> | null;
};
export type DocGeneratedDocumentCreate = z.infer<typeof docGeneratedDocumentInsertSchema>;
export type DocGeneratedDocumentUpdate = z.infer<typeof docGeneratedDocumentUpdateSchema>;

export class DocGeneratedDocumentService {
	constructor(public supabase: SupabaseClient<Database>) {}

	async getById(id: number): Promise<DocGeneratedDocumentWithTemplate | null> {
		const { data, error } = await this.supabase
			.from('doc_generated_document')
			.select('*, doc_template(*)')
			.eq('id', id)
			.single();

		if (error) {
			console.error(`Error fetching generated document by id: ${id}`, error);
			throw new Error('Failed to fetch generated document.');
		}
		return data;
	}

	async create(doc: DocGeneratedDocumentCreate): Promise<DocGeneratedDocumentWithTemplate> {
		const { data, error } = await this.supabase
			.from('doc_generated_document')
			.insert(doc)
			.select('*, doc_template(*)')
			.single();

		if (error) {
			console.error('Error creating generated document:', error);
			throw new Error('Failed to create generated document.');
		}
		if (!data) throw new Error('Failed to create document, no data returned.');
		return data;
	}

	async update(
		id: number,
		doc: DocGeneratedDocumentUpdate
	): Promise<DocGeneratedDocumentWithTemplate> {
		const { data, error } = await this.supabase
			.from('doc_generated_document')
			.update(doc)
			.eq('id', id)
			.select('*, doc_template(*)')
			.single();

		if (error) {
			console.error(`Error updating generated document by id: ${id}`, error);
			throw new Error('Failed to update generated document.');
		}
		if (!data) throw new Error('Failed to update document, no data returned.');
		return data;
	}

	async delete(id: number): Promise<void> {
		const { error } = await this.supabase.from('doc_generated_document').delete().eq('id', id);
		if (error) {
			console.error('Error deleting generated document:', error);
			throw new Error('Failed to delete generated document.');
		}
	}
}
