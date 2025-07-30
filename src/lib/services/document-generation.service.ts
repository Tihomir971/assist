import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Tables } from '@tihomir971/assist-shared';
import Mustache from 'mustache';

type DocGeneratedDocument = Tables<'doc_generated_document'> & {
	doc_template: Tables<'doc_template'> | null;
};

export class DocumentGenerationService {
	constructor(private supabase: SupabaseClient<Database>) {}

	/**
	 * Fetches the required data, renders a template, and returns the final HTML content.
	 * @param generatedDocument The generated document record, which includes the template and data_context.
	 * @returns The rendered HTML string.
	 */
	async generateDocumentContent(generatedDocument: DocGeneratedDocument): Promise<string> {
		if (!generatedDocument.doc_template) {
			throw new Error('Template not found for the generated document.');
		}
		if (!generatedDocument.data_context) {
			return generatedDocument.doc_template.content; // Return raw content if no context
		}

		const templateContent = generatedDocument.doc_template.content;
		const contextConfig = generatedDocument.data_context as Record<
			string,
			{ table: string; id: number }
		>;

		const viewData: Record<string, unknown> = {};

		// Dynamically fetch data for each role defined in the context
		for (const role in contextConfig) {
			const { table, id } = contextConfig[role];

			// Use the correct, specific type for the table name union
			const tableName = table as keyof Database['public']['Tables'];

			const { data, error } = await this.supabase.from(tableName).select('*').eq('id', id).single();

			if (error) {
				console.error(
					`Error fetching data for role '${role}' from table '${table}' with id '${id}':`,
					error
				);
				viewData[role] = { error: `Data not found for ${role}` };
			} else {
				viewData[role] = data;
			}
		}

		// Add some useful metadata to the view
		viewData.generated_at = new Date().toISOString();

		// Render the template with the fetched data
		const renderedContent = Mustache.render(templateContent, viewData);

		return renderedContent;
	}
}
