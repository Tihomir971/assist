import { PUBLIC_BEARER_TOKEN } from '$env/static/public';

export async function getERP(selectedProducts: number[]) {
	const apiUrl = 'https://api.kalisi.rs/bizsoft/assistant/sync/prods';
	const myHeaders = new Headers({ Authorization: 'Bearer ' + PUBLIC_BEARER_TOKEN });
	const formData = new FormData();
	formData.append('prods', JSON.stringify(selectedProducts));

	try {
		const response = await fetch(apiUrl, {
			method: 'POST',
			body: formData,
			headers: myHeaders
		});
		if (!response.ok) {
			throw new Error(`Network response was not OK: ${response.statusText}`);
		}

		const data = await response.text();
		console.log('dataERP', data);

		return data;
	} catch (error) {
		if (error instanceof TypeError && error.message === 'Failed to fetch') {
			console.error('Failed to fetch:', error.message);
		} else {
			console.error('There has been a problem with your fetch operation:', error);
		}
	}
}
