import type { PageServerLoad } from './$types';
import { ProductService, PartnerService, WarehouseService } from '$lib/services/supabase/';

export const load = (async ({ params, locals: { supabase } }) => {
	const productId = params.slug as unknown as number;

	const [product, partners, warehouses, replenishes] = await Promise.all([
		ProductService.getProduct(supabase, productId),
		PartnerService.getPartners(supabase),
		WarehouseService.getWarehouses(supabase),
		ProductService.getReplenishes(supabase, productId)
	]);
	return { product, partners, replenishes, warehouses };
}) satisfies PageServerLoad;
