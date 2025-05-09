// src/routes/api/cron/+server.ts
// import { CRON_SECRET } from '$env/static/private';

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
	const token = request.headers.get('x-cron-secret');

	if (token !== 'supersecret123') {
		return new Response('Unauthorized', {
			status: 401,
			headers: {
				'Access-Control-Allow-Origin': '*'
			}
		});
	}

	// If all good
	return new Response(JSON.stringify({ status: 'ok' }), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': '*'
		}
	});
};
