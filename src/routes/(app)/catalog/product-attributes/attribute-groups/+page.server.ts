import { createListPageLoader } from '$lib/utils/list-page.factory';
import { attributeGroupsTableConfig } from './datatable.config';
import { AttributeGroupService } from '$lib/services/supabase/attribute-group.service';

const listPage = createListPageLoader({
  config: attributeGroupsTableConfig,
  baseQuery: (supabase) => supabase.from('m_attribute_group').select('*'),
  service: AttributeGroupService
});

export const load = listPage.load;
export const actions = listPage.actions;