import { message, superValidate } from 'sveltekit-superforms';
import { zod, zod4 } from 'sveltekit-superforms/adapters';
import { fail, redirect, type RequestEvent } from '@sveltejs/kit';
import { deleteByIdSchema } from '$lib/types/zod-delete-by-id';
import type { SmartPayloadBuilder } from './smart-payload.builder';
import type { CRUDService } from '$lib/services/base/crud.service';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/supabase.types';
import { z, type ZodRawShape, type ZodTypeAny, type UnknownKeysParam } from 'zod';

// Define a more specific type for the getService function
// TCreateInferred and TUpdateInferred will be derived from the Zod schema passed to createSimpleCRUD
type GetServiceFn<TEntity extends { id: number }, TCreateInferred, TUpdateInferred> = (
	supabase: SupabaseClient<Database>
) => CRUDService<TEntity, TCreateInferred, TUpdateInferred>;

export function createSimpleCRUD<
	TEntity extends { id: number },
	// Schema is a ZodObject that outputs some type (any for now, will be TCreate)
	Schema extends z.ZodObject<ZodRawShape, UnknownKeysParam, ZodTypeAny>,
	// TCreate is explicitly inferred from the Schema
	TCreate = z.infer<Schema>,
	// TUpdate is Partial of TCreate, also aligning with SmartPayloadBuilder's expectation
	TUpdate = Partial<z.infer<Schema>>
>(
	serviceName: string,
	// getService now uses the inferred TCreate and TUpdate
	getService: GetServiceFn<TEntity, TCreate, TUpdate>,
	payloadBuilder: SmartPayloadBuilder<TCreate, TUpdate>,
	insertSchema: Schema, // The actual Zod schema object
	redirectOnDelete?: string
) {
	return {
		upsert: async ({
			request,
			locals: { supabase }
		}: RequestEvent & { locals: { supabase: SupabaseClient<Database> } }) => {
			const service = getService(supabase);
			// insertSchema is now correctly typed as Schema, which is a ZodObject
			const form = await superValidate(request, zod(insertSchema));

			if (!form.valid) return fail(400, { form });

			try {
				// form.data is now z.infer<Schema>, which is TCreate
				const id = (form.data as Partial<TEntity>).id;
				const isUpdate = id !== undefined && !isNaN(Number(id));

				if (isUpdate) {
					const payload = payloadBuilder.buildUpdatePayload(form.data as Record<string, unknown>);
					await service.update(Number(id), payload);
					return message(form, `${serviceName} updated successfully!`);
				} else {
					const payload = payloadBuilder.buildCreatePayload(form.data as Record<string, unknown>);
					const result = await service.create(payload);
					(form.data as Partial<TEntity>).id = result.id;
					return message(form, `${serviceName} created successfully!`);
				}
			} catch (err: unknown) {
				const errorMessage = err instanceof Error ? err.message : String(err);
				return message(form, { type: 'error', text: errorMessage } as const, {
					status: 400
				});
			}
		},

		delete: async ({
			request,
			locals: { supabase }
		}: RequestEvent & { locals: { supabase: SupabaseClient<Database> } }) => {
			const service = getService(supabase);
			const form = await superValidate(request, zod4(deleteByIdSchema));

			if (!form.valid) return fail(400, { form });

			try {
				await service.delete(form.data.id);
				if (redirectOnDelete) {
					throw redirect(303, redirectOnDelete);
				}
				return message(form, `${serviceName} deleted successfully!`);
			} catch (err: unknown) {
				if (err && typeof err === 'object' && 'status' in err && err.status === 303) {
					throw err; // Re-throw redirects
				}
				const errorMessage = err instanceof Error ? err.message : String(err);
				return message(form, { type: 'error', text: errorMessage } as const, {
					status: 500
				});
			}
		}
	};
}
