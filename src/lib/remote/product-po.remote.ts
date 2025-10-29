import { command, getRequestEvent } from '$app/server';
import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@tihomir971/assist-shared';
import { createErrorResponse, createSuccessResponse } from '$lib/types';

// Schema for setting pricelist to 0 for selected business partner
const setProductPoPriceToZeroSchema = z.object({
	c_bpartner_id: z.number().min(1, 'Business partner ID is required'),
	m_product_ids: z.array(z.number()).optional().default([]) // Optional: specific product IDs to target
});

// Schema for deleting records for selected business partner
const deleteProductPoSchema = z.object({
	c_bpartner_id: z.number().min(1, 'Business partner ID is required'),
	m_product_ids: z.array(z.number()).optional().default([]) // Optional: specific product IDs to target
});

/**
 * Set pricelist to 0 for selected business partner's product PO records
 */
export const setProductPoPriceToZero = command(
	setProductPoPriceToZeroSchema,
	async ({ c_bpartner_id, m_product_ids }) => {
		console.log('setProductPoPriceToZero called with:', { c_bpartner_id, m_product_ids });
		const { locals } = getRequestEvent();
		const supabase: SupabaseClient<Database> = locals.supabase;

		try {
			// Build the query
			let query = supabase
				.from('m_product_po')
				.update({ pricelist: 0 }, { count: 'estimated' })
				.eq('c_bpartner_id', c_bpartner_id);

			// If specific product IDs are provided, filter by them as well
			if (m_product_ids && m_product_ids.length > 0) {
				query = query.in('m_product_id', m_product_ids);
			}

			const { error, count } = await query.select();
			console.log(`Setting product PO pricelist to 0 for business partner ${count}`);

			if (error) {
				console.error('Error setting product PO pricelist to zero:', error);
				return createErrorResponse(`Failed to set pricelist to zero, ${error.message}`);
			}

			const updatedCount = count || 0;
			console.log(
				`Successfully updated ${updatedCount} product PO records for business partner ${c_bpartner_id}`
			);

			return createSuccessResponse(`Successfully updated ${updatedCount} records`, {
				updatedCount,
				c_bpartner_id
			});
		} catch (error) {
			console.error('Unexpected error in setProductPoPriceToZero:', error);
			return createErrorResponse('An unexpected error occurred while setting pricelist to zero');
		}
	}
);

/**
 * Delete product PO records for selected business partner
 */
export const deleteProductPo = command(
	deleteProductPoSchema,
	async ({ c_bpartner_id, m_product_ids }) => {
		const { locals } = getRequestEvent();
		const supabase: SupabaseClient<Database> = locals.supabase;

		try {
			console.log(`Deleting product PO records for business partner ${c_bpartner_id}`);

			// Build the query
			let query = supabase.from('m_product_po').delete().eq('c_bpartner_id', c_bpartner_id);

			// If specific product IDs are provided, filter by them, otherwise delete all
			if (m_product_ids && m_product_ids.length > 0) {
				query = query.in('m_product_id', m_product_ids);
			}

			const { error, count } = await query.select();

			if (error) {
				console.error('Error deleting product PO records:', error);
				return createErrorResponse(`Failed to delete records: ${error.message}`);
			}

			const deletedCount = count || 0;
			console.log(
				`Successfully deleted ${deletedCount} product PO records for business partner ${c_bpartner_id}`
			);

			return createSuccessResponse(`Successfully deleted ${deletedCount} records`, {
				deletedCount,
				c_bpartner_id
			});
		} catch (error) {
			console.error('Unexpected error in deleteProductPo:', error);
			return createErrorResponse('An unexpected error occurred while deleting records');
		}
	}
);
