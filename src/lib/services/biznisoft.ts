import { BIZNISOFT_API, BIZNISOFT_BEARER_TOKEN } from '$env/static/private';
import { error } from '@sveltejs/kit';

interface SendOptions {
	method: 'GET' | 'POST' | 'PUT' | 'DELETE';
	path: string;
	data?: unknown;
}

async function send<T>(options: SendOptions): Promise<T> {
	const { method, path, data } = options;
	const opts: RequestInit = { method };
	opts.headers = {
		Authorization: 'Bearer ' + BIZNISOFT_BEARER_TOKEN
	};

	if (data) {
		opts.headers = {
			...opts.headers,
			'Content-Type': 'application/json'
		};
		opts.body = JSON.stringify({ data });
	}

	const response = await fetch(`${BIZNISOFT_API}/${path}`, opts);

	if (response.ok || response.status === 422) {
		const text = await response.json();

		return text;
	}

	throw error(response.status);
}

export function get<T>(path: string): Promise<T> {
	return send({ method: 'GET', path });
}

export function del<T>(path: string): Promise<T> {
	return send({ method: 'DELETE', path });
}

export function post<T>(path: string, data: unknown): Promise<T> {
	return send({ method: 'POST', path, data });
}

export function put<T>(path: string, data: unknown): Promise<T> {
	return send({ method: 'PUT', path, data });
}
