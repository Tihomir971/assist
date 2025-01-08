import type { GroupBS, PartnerBS } from './types';
import type { Actions } from './$types';
import * as biznisoft from './biznisoft.js';

export const actions = {
	importPartners: async ({ locals: { supabase } }) => {
		const bsPartner: PartnerBS[] = await biznisoft.get('api/partner');
		const { data: mapBpartner, error: mapBpartnerError } = await supabase
			.from('c_channel_map_bpartner')
			.select('c_bpartner_id, resource_id')
			/* .eq('resource_id', partner.sifra.toString()) */
			.eq('c_channel_id', 1);
		if (mapBpartnerError || !mapBpartner) {
			console.log('mapBpartnerError', mapBpartnerError);
			return;
		}
		bsPartner.forEach(async (partner) => {
			const match =
				mapBpartner.find((entry) => entry.resource_id === partner.sifra.toString()) ?? null;

			if (!match) {
				const { data: bpartnerInsert, error: insertBpartnerError } = await supabase
					.from('c_bpartner')
					.insert({ name: partner.naziv, taxid: partner.pib, duns: partner.matbr })
					.select()
					.maybeSingle();
				if (insertBpartnerError) {
					console.log('insertBpartnerError', insertBpartnerError);
				}

				if (bpartnerInsert) {
					const { error: mapInsertError } = await supabase
						.from('c_channel_map_bpartner')
						.insert({
							c_channel_id: 1,
							c_bpartner_id: bpartnerInsert.id,
							resource_id: partner.sifra.toString()
						})
						.select()
						.maybeSingle();
					if (mapInsertError) {
						console.log('mapInsertError', mapInsertError);
					}
				}
				console.log('bpartnerInsert', bpartnerInsert);

				return;
			}

			const { error: updatePartnerError } = await supabase
				.from('c_bpartner')
				.update({ name: partner.naziv, taxid: partner.pib, duns: partner.matbr })
				.eq('id', match.c_bpartner_id);
			if (updatePartnerError) {
				console.log('updatePartnerError', updatePartnerError, match.c_bpartner_id, partner);
			}
			//console.log('partner.id', partner.sifra, partner.naziv);
		});
		console.log('Ende');
	},
	importCategories: async ({ locals: { supabase } }) => {
		const bsGroup: GroupBS[] = await biznisoft.get('api/catalog/group');
		const { data, error } = await supabase
			.from('c_channel_map_category')
			.select('updated')
			.order('updated', { ascending: false })
			.limit(1)
			.single();

		if (error) {
			console.error('Error:', error);
		} else {
			console.log('Most recent updatedAt:', data.updated);
		}
		bsGroup.forEach(async (group) => {
			try {
				const { data: updatedData, error: updateError } = await supabase
					.from('c_channel_map_category')
					.update({ resource_name: group.naziv })
					.eq('resource_id', group.sifra.toString())
					.select();
				if (updateError) {
					throw updateError;
				}
				if (updatedData && updatedData.length === 0) {
					const { error: insertError } = await supabase.from('c_channel_map_category').insert({
						c_channel_id: 1,
						resource_id: group.sifra.toString(),
						resource_name: group.naziv
					});
					if (insertError) {
						throw insertError;
					}
					//	console.log('New row inserted:', insertedData);
				} else {
					//	console.log('Row updated:', updatedData);
					return updatedData;
				}
			} catch (error: unknown) {
				if (error instanceof Error) {
					console.error('Error in updateOrInsertData:', error.message);
				} else if (typeof error === 'object' && error !== null && 'message' in error) {
					console.error('Error in updateOrInsertData:', (error as { message: string }).message);
				} else {
					console.error('An unknown error occurred in updateOrInsertData');
				}
				throw error;
			}
		});
		console.log('data?.updated', data?.updated);
		function convertDateFormat(dateString: string): string {
			const date = new Date(dateString);
			return date.toISOString().slice(0, 16).replace('T', ' ');
		}
		if (data?.updated) {
			const convertedDate = convertDateFormat(data?.updated);
			const { data: oldData, error: oldError } = await supabase
				.from('c_channel_map_category')
				.select('*')
				.lt('updated', convertedDate);
			if (oldError) {
				throw oldError;
			}
			console.log('oldData', oldData);
			//	console.log('updated', data?.updated);
		}
	}
} satisfies Actions;
