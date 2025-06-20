import { createListPageLoader } from '$lib/utils/list-page.factory';
import { attributeSetsTableConfig } from './datatable.config';
import { AttributeSetService } from '$lib/services/supabase/attribute-set.service';

const listPage = createListPageLoader({
	config: attributeSetsTableConfig,
	baseQuery: (supabase) => supabase.from('m_attributeset').select('*', { count: 'exact' }),
	service: AttributeSetService
});

export const load = listPage.load;
export const actions = listPage.actions;
