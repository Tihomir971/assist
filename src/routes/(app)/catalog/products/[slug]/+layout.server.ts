import type { LayoutServerLoad } from './$types';

export const load = (async ({ depends, params }) => {
	depends('catalog:product');
	const productId = params.slug as unknown as number;

	return { productId };
}) satisfies LayoutServerLoad;
