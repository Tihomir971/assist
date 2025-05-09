// src/routes/api/cron/+server.ts
// import { CRON_SECRET } from '$env/static/private';
import { json } from '@sveltejs/kit';

//export const POST = async ({ request }) => {
//	const auth = request.headers.get('authorization');
//
//	if (auth !== `Bearer ${CRON_SECRET}`) {
//		throw error(401, 'Unauthorized');
//	}
//
//	// Your cron logic here
//	console.log('Secure cron job triggered');
//
//	return json({ status: 'ok' });
//};
export const POST = async ({ request }) => {
	const headers = Object.fromEntries(request.headers.entries());

	return json({
		message: 'Inspecting headers',
		headers
	});
};
