import { BIZNISOFT_API, BIZNISOFT_BEARER_TOKEN } from '$env/static/private';
import type { Article } from './types';
const myHeaders = new Headers({ Authorization: 'Bearer ' + BIZNISOFT_BEARER_TOKEN });

export async function getItem(id: string): Promise<Article> {
	const apiUrl = BIZNISOFT_API + `/api/Article/GetItem?id=${id}`;

	const response = await fetch(apiUrl, {
		method: 'GET',
		headers: myHeaders
	});

	if (!response.ok) {
		const error = new Error(
			`Network response was not ok: ${response.statusText} (${response.status})`
		) as Error & { status: number };
		error.status = response.status;
		throw error;
	}

	return (await response.json()) as Article;
}
