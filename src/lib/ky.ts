import ky from 'ky';
import {
	CONNECTOR_API_BEARER,
	CONNECTOR_API_URL,
	SCRAPPER_API_BEARER,
	SCRAPPER_API_URL
} from '$env/static/private';
import type { ApiResponse } from '@tihomir971/assist-shared/api/api-response.types';

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

export async function typedPost<TRequest, TResponse>(
	url: string,
	data: NoInfer<TRequest>
): Promise<ApiResponse<TResponse>> {
	return await connector.post(url, { json: data }).json<ApiResponse<TResponse>>();
}
