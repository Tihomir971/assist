import type { RequestHandler } from './$types';
//import type { Tables } from '$lib/types/database.types';

export const POST: RequestHandler = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();
	if (session) {
		const { data: user } = await supabase
			.from('ad_user')
			.select('id')
			.eq('auth_user_id', session.user.id)
			.maybeSingle();
		if (user?.id) {
			let basketId: number | undefined = undefined;
			const { data: basketData } = await supabase
				.from('w_basket')
				.select('id')
				.eq('ad_user_id', session.user.id)
				.eq('isactive', true)
				.single();
			if (basketData) {
				basketId = basketData.id;
			} else {
				const { data, error } = await supabase
					.from('w_basket')
					.insert({ ad_user_id: user.id })
					.select()
					.single();
				console.log('else error', JSON.stringify(error));
				basketId = data?.id;
			}
			console.log('basketId', basketId);
		}
	}

	//const { id } = await request.json();

	//await supabase.from("w_basketline").insert({})
	return new Response();
};
