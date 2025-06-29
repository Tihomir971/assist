import { createListPageLoader } from '$lib/utils/list-page.factory';
import { contactsTableConfig } from './datatable.config';
import { PartnerService } from '$lib/services/supabase/partner.service';

const listPageLoader = createListPageLoader({
	config: contactsTableConfig,
	baseQuery: (supabase) =>
		supabase.from('c_bpartner').select('*', { count: 'exact' }).order('display_name'),
	service: PartnerService
});

export const load = async (event) => {
	event.depends('crm:contacts');
	return await listPageLoader.load(event);
};

export const actions = listPageLoader.actions;
