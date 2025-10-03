import { CRON_SECRET } from '$env/static/private';
import { error, json } from '@sveltejs/kit';

export const GET = async ({ url, request }) => {
	const token = request.headers.get('x-cron-secret') ?? url.searchParams.get('key');
	if (token !== CRON_SECRET) {
		throw error(401, 'Unauthorized');
	}

	// Your cron logic
	return json({ status: 'ok' });
};
