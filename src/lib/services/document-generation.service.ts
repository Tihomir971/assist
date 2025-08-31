import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Tables } from '$lib/types/supabase';
import type { NativeContextSchemaStructure } from '$lib/types/supabase.zod.schemas';
import { NativeSupabaseQueryBuilder } from './native-supabase-query.builder';
import Mustache from 'mustache';

type DocGeneratedDocument = Tables<'doc_generated_document'> & {
	doc_template: Tables<'doc_template'> | null;
};

export class DocumentGenerationService {
	private nativeQueryBuilder: NativeSupabaseQueryBuilder;

	constructor(private supabase: SupabaseClient<Database>) {
		this.nativeQueryBuilder = new NativeSupabaseQueryBuilder(supabase);
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

		// Check if template has context schema
		const contextSchema = generatedDocument.doc_template
			.context_schema as NativeContextSchemaStructure | null;

		let viewData: Record<string, unknown> = {};

		// Use native Supabase query format only
		if (contextSchema) {
			viewData = await this.fetchNativeData(
				contextSchema as NativeContextSchemaStructure,
				contextConfig
			);
		}

		// Add metadata
		viewData.generated_at = new Date().toISOString();

		// Debug logging to see what data is being passed to the template
		console.log(
			'[DocumentGenerationService] Final viewData for template:',
			JSON.stringify(viewData, null, 2)
		);
		console.log('[DocumentGenerationService] Template content:', templateContent);

		// Test array access specifically
		if (viewData.customer && typeof viewData.customer === 'object') {
			const customer = viewData.customer as Record<string, unknown>;
			console.log('[DocumentGenerationService] Customer object keys:', Object.keys(customer));
			if (customer.c_bpartner_location) {
				console.log(
					'[DocumentGenerationService] c_bpartner_location type:',
					typeof customer.c_bpartner_location
				);
				console.log(
					'[DocumentGenerationService] c_bpartner_location is array:',
					Array.isArray(customer.c_bpartner_location)
				);
				const locations = customer.c_bpartner_location;
				if (Array.isArray(locations)) {
					console.log('[DocumentGenerationService] c_bpartner_location length:', locations.length);
				}
				if (Array.isArray(locations) && locations.length > 0) {
					console.log(
						'[DocumentGenerationService] First location:',
						JSON.stringify(locations[0], null, 2)
					);
					const firstLocation = locations[0] as Record<string, unknown>;
					console.log('[DocumentGenerationService] First location phone:', firstLocation?.phone);
				}
			}
		}

		// Render template
		const renderedContent = Mustache.render(templateContent, viewData);

		console.log('[DocumentGenerationService] Rendered content:', renderedContent);

		return renderedContent;
	}

	/**
	 * Fetch data using native Supabase query format (preferred method)
	 */
	private async fetchNativeData(
		contextSchema: NativeContextSchemaStructure,
		contextConfig: Record<string, { table: string; id: number }>
	): Promise<Record<string, unknown>> {
		const viewData: Record<string, unknown> = {};

		console.log('[DocumentGenerationService] fetchNativeData called with:');
		console.log('- contextSchema:', JSON.stringify(contextSchema, null, 2));
		console.log('- contextConfig:', JSON.stringify(contextConfig, null, 2));

		for (const role of contextSchema.roles) {
			const roleConfig = contextConfig[role.name];
			if (!roleConfig) {
				console.warn(`No context config found for role: ${role.name}`);
				continue;
			}

			console.log(
				`[DocumentGenerationService] Processing role: ${role.name} with ID: ${roleConfig.id}`
			);

			try {
				const roleData = await this.nativeQueryBuilder.fetchRoleData(role, roleConfig.id);
				console.log(
					`[DocumentGenerationService] Role ${role.name} data:`,
					JSON.stringify(roleData, null, 2)
				);
				viewData[role.name] = roleData;
			} catch (error) {
				console.error(`Error fetching data for role ${role.name}:`, error);
				viewData[role.name] = { error: `Data not found for ${role.name}` };
			}
		}

		console.log('[DocumentGenerationService] Final viewData:', JSON.stringify(viewData, null, 2));
		return viewData;
	}
}
