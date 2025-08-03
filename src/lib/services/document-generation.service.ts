import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Tables } from '@tihomir971/assist-shared';
import type { EnhancedContextSchemaStructure } from '$lib/types/supabase.zod.schemas';
import { EnhancedQueryBuilder } from './enhanced-query.builder';
import Mustache from 'mustache';

type DocGeneratedDocument = Tables<'doc_generated_document'> & {
	doc_template: Tables<'doc_template'> | null;
};

export class DocumentGenerationService {
	private queryBuilder: EnhancedQueryBuilder;

	constructor(private supabase: SupabaseClient<Database>) {
		this.queryBuilder = new EnhancedQueryBuilder(supabase);
	}

	/**
	 * Generate document content with enhanced linked table support
	 * Maintains backward compatibility with existing templates
	 */
	async generateDocumentContent(generatedDocument: DocGeneratedDocument): Promise<string> {
		if (!generatedDocument.doc_template) {
			throw new Error('Template not found for the generated document.');
		}

		if (!generatedDocument.data_context) {
			return generatedDocument.doc_template.content;
		}

		const templateContent = generatedDocument.doc_template.content;
		const contextConfig = generatedDocument.data_context as Record<
			string,
			{ table: string; id: number }
		>;

		// Check if template has enhanced context schema
		const contextSchema = generatedDocument.doc_template
			.context_schema as EnhancedContextSchemaStructure | null;

		let viewData: Record<string, unknown> = {};

		// Detect if this is an enhanced schema
		const isEnhancedSchema = contextSchema?.roles?.some(
			(role) => 'linked_tables' in role && role.linked_tables && role.linked_tables.length > 0
		);

		if (isEnhancedSchema && contextSchema) {
			// Use enhanced schema-based data fetching
			viewData = await this.fetchEnhancedData(contextSchema, contextConfig);
		} else {
			// Fallback to legacy simple data fetching for backward compatibility
			viewData = await this.fetchLegacyData(contextConfig);
		}

		// Add metadata
		viewData.generated_at = new Date().toISOString();

		// Render template
		const renderedContent = Mustache.render(templateContent, viewData);
		return renderedContent;
	}

	/**
	 * Fetch data using enhanced context schema with linked tables
	 */
	private async fetchEnhancedData(
		contextSchema: EnhancedContextSchemaStructure,
		contextConfig: Record<string, { table: string; id: number }>
	): Promise<Record<string, unknown>> {
		const viewData: Record<string, unknown> = {};

		for (const role of contextSchema.roles) {
			const roleConfig = contextConfig[role.name];
			if (!roleConfig) {
				console.warn(`No context config found for role: ${role.name}`);
				continue;
			}

			try {
				const roleData = await this.queryBuilder.fetchRoleData(role, roleConfig.id);
				viewData[role.name] = roleData;
			} catch (error) {
				console.error(`Error fetching data for role ${role.name}:`, error);
				viewData[role.name] = { error: `Data not found for ${role.name}` };
			}
		}

		return viewData;
	}

	/**
	 * Legacy data fetching for backward compatibility
	 * This is the original implementation
	 */
	private async fetchLegacyData(
		contextConfig: Record<string, { table: string; id: number }>
	): Promise<Record<string, unknown>> {
		const viewData: Record<string, unknown> = {};

		for (const role in contextConfig) {
			const { table, id } = contextConfig[role];
			const tableName = table as keyof Database['public']['Tables'];

			const { data, error } = await this.supabase.from(tableName).select('*').eq('id', id).single();

			if (error) {
				console.error(`Error fetching data for role '${role}':`, error);
				viewData[role] = { error: `Data not found for ${role}` };
			} else {
				viewData[role] = data;
			}
		}

		return viewData;
	}
}
