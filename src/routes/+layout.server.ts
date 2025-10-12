import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession, app }, cookies }) => {
	const { session } = await safeGetSession();
	return {
		session,
		app,
		cookies: cookies.getAll()
	};
};
