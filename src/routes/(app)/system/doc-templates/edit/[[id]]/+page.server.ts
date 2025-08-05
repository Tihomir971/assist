import { error, fail, json, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { docTemplateInsertSchema } from '$lib/types/supabase.zod.schemas';
import { DocTemplateService } from '$lib/services/supabase';
import { DocumentGenerationService } from '$lib/services/document-generation.service';
import type { Tables } from '@tihomir971/assist-shared';

export const load = async ({ params, locals: { supabase } }) => {
	const id = params.id ? parseInt(params.id) : null;
	const isCreateMode = id === null;

	let form;
	if (isCreateMode) {
		form = await superValidate(zod4(docTemplateInsertSchema));
	} else {
		const service = new DocTemplateService(supabase);
		const entity = await service.getById(id);
		if (!entity) {
			error(404, 'Document template not found');
		}

		// Convert context_schema to string for display in textarea
		const contextSchemaString = entity.context_schema
			? typeof entity.context_schema === 'string'
				? entity.context_schema
				: JSON.stringify(entity.context_schema, null, 2)
			: '';

		const formData = {
			name: entity.name,
			description: entity.description,
			content: entity.content,
			context_schema: contextSchemaString,
			is_active: entity.is_active
		};

		form = await superValidate(formData, zod4(docTemplateInsertSchema));
	}

	return {
		form,
		entity: form.data,
		isCreateMode
	};
};

export const actions = {
	upsert: async ({ request, params, locals: { supabase } }) => {
		const form = await superValidate(request, zod4(docTemplateInsertSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const service = new DocTemplateService(supabase);
		try {
			const id = params.id ? parseInt(params.id) : null;
			const isUpdate = id !== null && !isNaN(id) && id > 0;

			// Parse context_schema JSON string if provided
			let contextSchema = null;
			if (form.data.context_schema && form.data.context_schema.trim()) {
				try {
					contextSchema = JSON.parse(form.data.context_schema);
				} catch {
					return fail(400, {
						form,
						error: 'Invalid JSON format in Context Schema field'
					});
				}
			}

			const payload = {
				name: form.data.name,
				description: form.data.description,
				content: form.data.content,
				context_schema: contextSchema,
				is_active: form.data.is_active
			};

			if (isUpdate) {
				const updatedEntity = await service.update(id, payload);
				return { form, success: true, entity: updatedEntity, operation: 'update' };
			} else {
				const createdEntity = await service.create(payload);
				return { form, success: true, entity: createdEntity, operation: 'create' };
			}
		} catch (err) {
			console.error('Error upserting document template:', err);
			return fail(500, { form, error: 'An unexpected error occurred.' });
		}
	},

	delete: async ({ request, params, locals: { supabase } }) => {
		const form = await superValidate(request, zod4(docTemplateInsertSchema));
		if (!form.valid) {
			return fail(400, { form });
		}
		const id = params.id ? parseInt(params.id) : null;
		if (!id) {
			return fail(400, { form, error: 'Invalid ID' });
		}

		try {
			const service = new DocTemplateService(supabase);
			await service.delete(id);
			redirect(303, '/system/doc-templates');
		} catch (err: unknown) {
			const error = err as { code?: string };
			if (error.code === '23503') {
				return fail(409, {
					form,
					error:
						'This template is in use and cannot be deleted. Please reassign documents using this template before deleting.'
				});
			}
			console.error('Error deleting document template:', err);
			return fail(500, { form, error: 'Failed to delete document template' });
		}
	},

	preview: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const templateContent = formData.get('content') as string;
		const dataContextString = formData.get('data_context') as string;

		if (!templateContent) {
			return json({ error: 'Template content is missing.' }, { status: 400 });
		}

		try {
			const data_context = JSON.parse(dataContextString);

			const mockGeneratedDocument = {
				doc_template: {
					content: templateContent,
					id: 0,
					name: 'preview',
					description: null,
					context_schema: null,
					is_active: true,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString()
				},
				data_context: data_context
			};

			const generationService = new DocumentGenerationService(supabase);
			const renderedContent = await generationService.generateDocumentContent(
				mockGeneratedDocument as unknown as Tables<'doc_generated_document'> & {
					doc_template: Tables<'doc_template'> | null;
				}
			);

			return json({ renderedContent });
		} catch (e) {
			console.error('Preview generation failed:', e);
			return json(
				{ error: 'Failed to generate preview. Invalid data context JSON.' },
				{ status: 400 }
			);
		}
	}
};
