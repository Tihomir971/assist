import { error, fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import {
	DocGeneratedDocumentService,
	type DocGeneratedDocumentWithTemplate,
	DocTemplateService,
	PartnerService
} from '$lib/services/supabase';
import type { ContextSchemaStructure } from '$lib/types/supabase.zod.schemas';

type LookupData = { value: number; label: string }[];
import { DocumentGenerationService } from '$lib/services/document-generation.service';
import {
	docGeneratedDocumentInsertSchema,
	docGeneratedDocumentUpdateSchema
} from '$lib/types/supabase.zod.schemas';
import type {
	DocGeneratedDocumentCreate,
	DocGeneratedDocumentUpdate
} from '$lib/services/supabase/doc-generated-document.service';
import { deleteByIdSchema } from '$lib/types/zod-delete-by-id';

export const load = async ({ params, locals: { supabase } }) => {
	const id = params.id ? parseInt(params.id) : null;
	const isCreateMode = id === null;

	const generatedDocService = new DocGeneratedDocumentService(supabase);
	let form;
	let entity: DocGeneratedDocumentWithTemplate | null = null;

	if (isCreateMode) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		form = await superValidate(zod4(docGeneratedDocumentInsertSchema as any));
	} else {
		entity = await generatedDocService.getById(id);
		if (!entity) {
			error(404, 'Generated document not found');
		}
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		form = await superValidate(entity, zod4(docGeneratedDocumentUpdateSchema as any));
	}

	const templateService = new DocTemplateService(supabase);
	const partnerService = new PartnerService(supabase);

	// Get templates with context schema for dynamic form generation
	const [templatesWithSchema, partners] = await Promise.all([
		templateService.getLookupWithSchema(),
		partnerService.getLookup()
	]);

	// Create a helper function to get lookup data for different source tables
	const getLookupDataForTable = async (sourceTable: string) => {
		switch (sourceTable) {
			case 'c_bpartner':
				return await partnerService.getLookup();
			// Add more cases as needed for other tables
			default:
				return [];
		}
	};

	// If we have an entity, we might need to fetch additional lookup data
	// based on the template's context schema
	let additionalLookups: Record<string, LookupData> = {};

	if (entity?.doc_template) {
		try {
			const template = await templateService.getTemplateWithSchema(entity.doc_template_id);
			if (template?.context_schema) {
				const contextSchema = template.context_schema as ContextSchemaStructure;

				// Fetch lookup data for each role's source table
				const lookupPromises = contextSchema.roles.map(async (role) => {
					const lookupData = await getLookupDataForTable(role.source_table);
					return [role.source_table, lookupData];
				});

				const lookupResults = await Promise.all(lookupPromises);
				additionalLookups = Object.fromEntries(lookupResults);
			}
		} catch (error) {
			console.error('Error parsing context schema:', error);
		}
	}

	return {
		form,
		entity,
		isCreateMode,
		lookups: {
			templates: templatesWithSchema,
			partners,
			...additionalLookups
		}
	};
};

export const actions = {
	upsert: async ({ request, locals: { supabase, session } }) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const form = await superValidate(request, zod4(docGeneratedDocumentInsertSchema as any));
		if (!form.valid) {
			return fail(400, { form });
		}

		const data = form.data as DocGeneratedDocumentCreate & { id?: number };
		const id = data.id ? Number(data.id) : null;
		const isUpdate = id !== null;

		const generatedDocService = new DocGeneratedDocumentService(supabase);
		let savedDoc: DocGeneratedDocumentWithTemplate;

		try {
			if (isUpdate) {
				const updatePayload: DocGeneratedDocumentUpdate = {
					doc_template_id: data.doc_template_id,
					data_context: data.data_context
				};
				savedDoc = await generatedDocService.update(id, updatePayload);
			} else {
				const authUserId = session?.user?.id;
				let adUserId: number | undefined = undefined;
				if (authUserId) {
					const { data: userRecord } = await supabase
						.from('ad_user')
						.select('id')
						.eq('auth_user_id', authUserId)
						.single();
					if (userRecord) {
						adUserId = userRecord.id;
					}
				}
				const createPayload: DocGeneratedDocumentCreate = {
					doc_template_id: data.doc_template_id,
					data_context: data.data_context,
					created_by: adUserId,
					generated_content: '' // Start with empty content
				};
				savedDoc = await generatedDocService.create(createPayload);
			}

			// Regenerate content
			const generationService = new DocumentGenerationService(supabase);
			const renderedContent = await generationService.generateDocumentContent(savedDoc);

			// Update with generated content
			const finalDoc = await generatedDocService.update(savedDoc.id, {
				generated_content: renderedContent
			});

			return { form, success: true, entity: finalDoc };
		} catch (e: unknown) {
			const errorMsg = e instanceof Error ? e.message : 'An unknown error occurred.';
			return fail(500, { form, error: errorMsg });
		}
	},

	delete: async ({ request, locals: { supabase } }) => {
		const form = await superValidate(request, zod4(deleteByIdSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const id = form.data.id;

		try {
			const service = new DocGeneratedDocumentService(supabase);
			await service.delete(id);
		} catch (e: unknown) {
			const errorMsg = e instanceof Error ? e.message : 'An unknown error occurred.';
			return fail(500, { form, error: errorMsg });
		}

		redirect(303, '/crm/generate-document');
	}
};
