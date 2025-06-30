import { createListPageLoader } from '$lib/utils/list-page.factory';
import { attributesTableConfig } from './datatable.config';
import { AttributeService } from '$lib/services/supabase/attribute.service';
import { AttributeGroupService } from '$lib/services/supabase/attribute-group.service';

const attributeTypeOptions = [
	{ value: 'single_select', label: 'Single Select' },
	{ value: 'multi_select', label: 'Multi Select' },
	{ value: 'text', label: 'Text' },
	{ value: 'number', label: 'Number' },
	{ value: 'boolean', label: 'Boolean' },
	{ value: 'date', label: 'Date' }
];

const listPage = createListPageLoader({
	config: attributesTableConfig,
	baseQuery: (supabase) =>
		supabase.from('m_attribute').select('*, m_attribute_group!inner(name), c_uom(name, uomsymbol)'),
	service: AttributeService,
	lookupData: {
		attributeGroups: (service) => new AttributeGroupService(service.supabase).getLookup(),
		attributeTypes: () => Promise.resolve(attributeTypeOptions)
	}
});

export const load = listPage.load;
export const actions = listPage.actions;
