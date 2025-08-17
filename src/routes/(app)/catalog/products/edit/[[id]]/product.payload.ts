import { mProductInsertSchema, mProductUpdateSchema } from '@tihomir971/assist-shared';
import type { MProductInsert, MProductUpdate } from '@tihomir971/assist-shared';
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder4';

export const productPayloadBuilder = new SmartPayloadBuilder<MProductInsert, MProductUpdate>(
	{
		schema: mProductInsertSchema,
		defaults: {
			is_active: true,
			is_self_service: false,
			discontinued: false,
			net_quantity: 0,
			shelf_life: 0
		},
		transformers: {
			m_product_brand_id: (value) => (!value ? null : Number(value)),
			m_product_category_id: (value) => (!value ? null : Number(value)),
			attributeset_id: (value) => (!value ? null : Number(value)),
			c_taxcategory_id: (value) => (!value ? null : Number(value)),
			c_uom_id: (value) => (!value ? null : Number(value)),
			net_qty_uom_id: (value) => (!value ? null : Number(value))
		}
	},
	{
		schema: mProductUpdateSchema,
		transformers: {
			m_product_brand_id: (value) => (!value ? null : Number(value)),
			m_product_category_id: (value) => (!value ? null : Number(value)),
			attributeset_id: (value) => (!value ? null : Number(value)),
			c_taxcategory_id: (value) => (!value ? null : Number(value)),
			c_uom_id: (value) => (!value ? null : Number(value)),
			net_qty_uom_id: (value) => (!value ? null : Number(value))
		}
	}
);
