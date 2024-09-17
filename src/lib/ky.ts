import { CONNECTOR_API_BEARER, CONNECTOR_API_URL } from '$env/static/private';
import ky from 'ky';

export const connector = ky.create({
	prefixUrl: CONNECTOR_API_URL,
	headers: {
		Authorization: `Bearer ${CONNECTOR_API_BEARER}`
	}
});
