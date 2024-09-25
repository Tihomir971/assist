import {
	CONNECTOR_API_BEARER,
	CONNECTOR_API_URL,
	SCRAPPER_API_BEARER,
	SCRAPPER_API_URL
} from '$env/static/private';
import ky from 'ky';

export const connector = ky.create({
	prefixUrl: CONNECTOR_API_URL,
	headers: {
		Authorization: `Bearer ${CONNECTOR_API_BEARER}`
	}
});
export const scrapper = ky.create({
	prefixUrl: SCRAPPER_API_URL,
	headers: {
		Authorization: `Bearer ${SCRAPPER_API_BEARER}`
	},
	timeout: 300000
});
