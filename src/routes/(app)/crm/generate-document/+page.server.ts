import { DocGeneratedDocumentService, DocTemplateService } from '$lib/services/supabase';
import { createListPageLoader } from '$lib/utils/list-page.factory';
import { generatedDocumentConfig } from './datatable.config';

const listPageLoader = createListPageLoader({
	config: generatedDocumentConfig,
	baseQuery: (supabase) =>
		supabase
			.from('doc_generated_document')
			.select('*, doc_template(name), created_by_user:ad_user(first_name, last_name)', {
				count: 'exact'
			})
			.order('created_at', { ascending: false }),
	service: DocGeneratedDocumentService,
	lookupData: {
		templates: (service) => new DocTemplateService(service.supabase).getLookup()
	}
});

export const load = async (event) => {
	event.depends('crm:generated-documents');
	return await listPageLoader.load(event);
};

export const actions = listPageLoader.actions;
