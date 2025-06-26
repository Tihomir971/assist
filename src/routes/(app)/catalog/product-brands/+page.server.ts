import { createListPageLoader } from '$lib/utils/list-page.factory';
import { brandsTableConfig } from './datatable.config';
import { BrandService } from '$lib/services/supabase/brand.service';

const listPage = createListPageLoader({
	config: brandsTableConfig,
	baseQuery: (supabase) => supabase.from('m_product_brands').select('*').order('name'),
	service: BrandService,
	lookupData: {}
});

export const load = listPage.load;
export const actions = listPage.actions;
