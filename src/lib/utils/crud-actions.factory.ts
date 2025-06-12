import { message, superValidate } from 'sveltekit-superforms';
import { zod, zod4 } from 'sveltekit-superforms/adapters';
import { fail, redirect, type RequestEvent } from '@sveltejs/kit';
import { deleteByIdSchema } from '$lib/types/zod-delete-by-id';
import type { CRUDService } from '$lib/services/base/crud.service';
import type { PayloadBuilder } from './form-payload.utils';
import type { ZodSchema } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types/supabase.types';

export interface CRUDActionFactoryConfig<
	T extends { id: number },
	CreateT extends Record<string, unknown>,
	UpdateT
> {
	payloadBuilder: PayloadBuilder<CreateT, UpdateT>;
	entityName: string;
	insertSchema: ZodSchema;
	redirectOnDelete?: string;
	onCreateSuccess?: (entity: T) => void;
	onUpdateSuccess?: (entity: T) => void;
	onDeleteSuccess?: () => void;
}

export function createCRUDActionFactory<
	T extends { id: number },
	CreateT extends Record<string, unknown>,
	UpdateT
>(
	getService: (supabase: SupabaseClient<Database>) => CRUDService<T, CreateT, UpdateT>,
	config: CRUDActionFactoryConfig<T, CreateT, UpdateT>
) {
	return {
		upsert: async ({
			request,
			locals: { supabase }
		}: {
			request: RequestEvent['request'];
			locals: { supabase: SupabaseClient<Database> };
		}) => {
			const service = getService(supabase);
			const formData = await request.formData();
			const form = await superValidate(formData, zod(config.insertSchema));

			if (!form.valid) return fail(400, { form });

			try {
				const entityData = { ...form.data } as { id?: string | number | undefined } & CreateT;
				const isUpdate = entityData.id && !isNaN(Number(entityData.id));

				if (isUpdate) {
					const id = Number(entityData.id);
					const updatePayload = config.payloadBuilder.buildUpdatePayload(entityData);
					const result = await service.update(id, updatePayload);
					config.onUpdateSuccess?.(result);
					return message(form, `${config.entityName} updated successfully!`);
				} else {
					if (
						'id' in entityData &&
						(entityData.id === undefined || entityData.id === null || isNaN(Number(entityData.id)))
					) {
						delete entityData.id;
					}

					const createPayload = config.payloadBuilder.buildCreatePayload(entityData);
					const result = await service.create(createPayload);
					(form.data as Record<string, unknown>).id = result.id;
					config.onCreateSuccess?.(result);
					return message(form, `${config.entityName} created successfully!`);
				}
			} catch (err: unknown) {
				console.error(`${config.entityName} upsert error:`, err);
				const errorMessage = err instanceof Error ? err.message : String(err);
				return message(form, { type: 'error', text: errorMessage }, { status: 400 });
			}
		},

		delete: async ({
			request,
			locals: { supabase }
		}: {
			request: RequestEvent['request'];
			locals: { supabase: SupabaseClient<Database> };
		}) => {
			const service = getService(supabase);
			const formData = await request.formData();
			const form = await superValidate(formData, zod4(deleteByIdSchema));

			if (!form.valid) return fail(400, { form });

			try {
				await service.delete(form.data.id);
				config.onDeleteSuccess?.();

				if (config.redirectOnDelete) {
					throw redirect(303, config.redirectOnDelete);
				}
				return message(form, `${config.entityName} deleted successfully!`);
			} catch (err: unknown) {
				if (typeof err === 'object' && err !== null && 'status' in err && err.status === 303) {
					throw err;
				}

				console.error(`${config.entityName} delete error:`, err);
				const errorMessage = err instanceof Error ? err.message : String(err);
				return message(form, { type: 'error', text: errorMessage }, { status: 500 });
			}
		}
	};
}
