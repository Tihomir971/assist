import { DocTemplateService } from '$lib/services/supabase';
import { createListPageLoader } from '$lib/utils/list-page.factory';
import { docTemplateConfig } from './datatable.config';

const listPageLoader = createListPageLoader({
	config: docTemplateConfig,
	baseQuery: (supabase) =>
		supabase.from('doc_template').select('*', { count: 'exact' }).order('name'),
	service: DocTemplateService
});

export const load = async (event) => {
	event.depends('system:doc-templates');
	return await listPageLoader.load(event);
};

export const actions = listPageLoader.actions;
