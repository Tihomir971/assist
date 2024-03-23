//
/* 
export async function getERPnew(selectedProducts: number[]) {
	const apiUrl = 'https://biznisoft-api.kalisi.rs/api/catalog/getProduct';
	const myHeaders = new Headers({ Authorization: 'Bearer ' + BIZNISOFT_BEARER_TOKEN });
	const urlObject = new URL(apiUrl);

	for (const item of selectedProducts) {
		const searchParams = new URLSearchParams({ id: item.toString() }); */
// Append the search parameters to the URL object
/* 		urlObject.search = searchParams.toString();
		return fetch(urlObject)
			.then((response) => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.catch((error) => {
				console.error('There was a problem with your fetch operation:', error);
			});
	} */
// Create a new URL object
// Create a new URLSearchParams object

/* 	return fetch(apiUrl, {
		method: 'POST',
		headers: myHeaders
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json();
		})
		.catch((error) => {
			console.error('There was a problem with your fetch operation:', error);
		});
	return 'Bravo'; */
/* 	try {
		const response = await fetch(apiUrl, {
			method: 'get',
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
	} */
/* } */
