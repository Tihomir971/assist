# Enhanced Document Generation Implementation Guide

## Step-by-Step Implementation

This guide provides the exact code changes needed to implement the enhanced document generation system with linked table support.

## Phase 1: Core Type Definitions and Schemas

### 1.1 Update Zod Schemas

**File: `src/lib/types/supabase.zod.schemas.ts`**

Add these new schemas after the existing context schema definitions:

```typescript
// Enhanced join condition schema
export const joinConditionSchema = z.object({
  local_field: z.string().min(1, 'Local field is required'),
  foreign_field: z.string().min(1, 'Foreign field is required')
});

// Enhanced where condition schema
export const whereConditionSchema = z.object({
  field: z.string().min(1, 'Field is required'),
  operator: z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'in']),
  value: z.any()
});

// Enhanced order by schema
export const orderByClauseSchema = z.object({
  field: z.string().min(1, 'Field is required'),
  direction: z.enum(['asc', 'desc']).default('asc')
});

// Enhanced linked table definition schema
export const linkedTableDefinitionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  relationship_type: z.enum(['one_to_one', 'one_to_many', 'many_to_many']),
  join_table: z.string().optional(),
  join_conditions: z.array(joinConditionSchema).min(1, 'At least one join condition is required'),
  target_table: z.string().optional(),
  target_join: joinConditionSchema.optional(),
  select_fields: z.array(z.string()).min(1, 'At least one select field is required'),
  include_join_fields: z.array(z.string()).optional(),
  where_conditions: z.array(whereConditionSchema).optional(),
  order_by: z.array(orderByClauseSchema).optional()
});

// Enhanced context schema role (extends existing)
export const enhancedContextSchemaRoleSchema = contextSchemaRoleSchema.extend({
  linked_tables: z.array(linkedTableDefinitionSchema).optional()
});

// Enhanced context schema structure
export const enhancedContextSchemaStructureSchema = z.object({
  roles: z.array(enhancedContextSchemaRoleSchema).min(1, 'At least one role is required')
});

// Export enhanced types
export type JoinCondition = z.infer<typeof joinConditionSchema>;
export type WhereCondition = z.infer<typeof whereConditionSchema>;
export type OrderByClause = z.infer<typeof orderByClauseSchema>;
export type LinkedTableDefinition = z.infer<typeof linkedTableDefinitionSchema>;
export type EnhancedContextSchemaRole = z.infer<typeof enhancedContextSchemaRoleSchema>;
export type EnhancedContextSchemaStructure = z.infer<typeof enhancedContextSchemaStructureSchema>;
```

## Phase 2: Enhanced Query Builder

### 2.1 Create Enhanced Query Builder

**File: `src/lib/services/enhanced-query.builder.ts`**

```typescript
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@tihomir971/assist-shared';
import type { 
  EnhancedContextSchemaRole, 
  LinkedTableDefinition,
  JoinCondition,
  WhereCondition,
  OrderByClause 
} from '$lib/types/supabase.zod.schemas';

export class EnhancedQueryBuilder {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Build and execute a complex query with joins based on role definition
   */
  async fetchRoleData(role: EnhancedContextSchemaRole, entityId: number): Promise<Record<string, any>> {
    // Fetch main entity data
    const mainData = await this.fetchMainEntity(role.source_table, entityId);
    if (!mainData) {
      throw new Error(`Entity not found in ${role.source_table} with id ${entityId}`);
    }

    const result: Record<string, any> = { ...mainData };

    // Fetch linked table data if defined
    if (role.linked_tables) {
      for (const linkedTable of role.linked_tables) {
        const linkedData = await this.fetchLinkedTableData(
          role.source_table,
          entityId,
          linkedTable
        );
        result[linkedTable.name] = linkedData;
      }
    }

    return result;
  }

  /**
   * Fetch main entity data
   */
  private async fetchMainEntity(tableName: string, entityId: number): Promise<Record<string, any> | null> {
    const { data, error } = await this.supabase
      .from(tableName as any)
      .select('*')
      .eq('id', entityId)
      .single();

    if (error) {
      console.error(`Error fetching main entity from ${tableName}:`, error);
      return null;
    }

    return data;
  }

  /**
   * Fetch linked table data with complex joins
   * For the customer locations example, this will:
   * 1. Query c_bpartner_location where c_bpartner_id = entityId
   * 2. Join with l_location using l_location_id
   * 3. Return combined data
   */
  private async fetchLinkedTableData(
    sourceTable: string,
    entityId: number,
    linkedTable: LinkedTableDefinition
  ): Promise<any[]> {
    try {
      // For customer locations: start with c_bpartner_location
      const queryTable = linkedTable.join_table || linkedTable.target_table || sourceTable;
      
      // Build select clause for joined data
      let selectClause = '';
      
      if (linkedTable.join_table && linkedTable.target_table) {
        // Complex join: join_table + target_table
        // Example: c_bpartner_location fields + l_location fields
        const joinFields = linkedTable.include_join_fields || [];
        const targetFields = linkedTable.select_fields.map(field => 
          `${linkedTable.target_table}(${field})`
        );
        selectClause = [...joinFields, ...targetFields].join(', ');
      } else {
        // Simple case: just select from one table
        selectClause = linkedTable.select_fields.join(', ');
      }

      let query = this.supabase.from(queryTable as any).select(selectClause);

      // Apply join conditions to link to source entity
      for (const joinCondition of linkedTable.join_conditions) {
        if (joinCondition.local_field === 'id') {
          // This links the join table to the main entity
          query = query.eq(joinCondition.foreign_field, entityId);
        }
      }

      // Apply where conditions (e.g., is_active = true)
      if (linkedTable.where_conditions) {
        for (const whereCondition of linkedTable.where_conditions) {
          query = this.applyWhereCondition(query, whereCondition);
        }
      }

      // Apply ordering
      if (linkedTable.order_by) {
        for (const orderBy of linkedTable.order_by) {
          query = query.order(orderBy.field, { ascending: orderBy.direction === 'asc' });
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error(`Error fetching linked table data for ${linkedTable.name}:`, error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error(`Error in fetchLinkedTableData for ${linkedTable.name}:`, error);
      return [];
    }
  }

  /**
   * Apply where condition to query
   */
  private applyWhereCondition(query: any, condition: WhereCondition): any {
    switch (condition.operator) {
      case 'eq':
        return query.eq(condition.field, condition.value);
      case 'neq':
        return query.neq(condition.field, condition.value);
      case 'gt':
        return query.gt(condition.field, condition.value);
      case 'gte':
        return query.gte(condition.field, condition.value);
      case 'lt':
        return query.lt(condition.field, condition.value);
      case 'lte':
        return query.lte(condition.field, condition.value);
      case 'like':
        return query.like(condition.field, condition.value);
      case 'in':
        return query.in(condition.field, condition.value);
      default:
        return query;
    }
  }
}
```

## Phase 3: Enhanced Document Generation Service

### 3.1 Update Existing Service

**File: `src/lib/services/document-generation.service.ts`**

Replace the existing service with this enhanced version:

```typescript
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Tables } from '@tihomir971/assist-shared';
import type { EnhancedContextSchemaStructure } from '$lib/types/supabase.zod.schemas';
import { EnhancedQueryBuilder } from './enhanced-query.builder';
import Mustache from 'mustache';

type DocGeneratedDocument = Tables<'doc_generated_document'> & {
  doc_template: Tables<'doc_template'> | null;
};

export class DocumentGenerationService {
  private queryBuilder: EnhancedQueryBuilder;

  constructor(private supabase: SupabaseClient<Database>) {
    this.queryBuilder = new EnhancedQueryBuilder(supabase);
  }

  /**
   * Generate document content with enhanced linked table support
   * Maintains backward compatibility with existing templates
   */
  async generateDocumentContent(generatedDocument: DocGeneratedDocument): Promise<string> {
    if (!generatedDocument.doc_template) {
      throw new Error('Template not found for the generated document.');
    }

    if (!generatedDocument.data_context) {
      return generatedDocument.doc_template.content;
    }

    const templateContent = generatedDocument.doc_template.content;
    const contextConfig = generatedDocument.data_context as Record<
      string,
      { table: string; id: number }
    >;

    // Check if template has enhanced context schema
    const contextSchema = generatedDocument.doc_template.context_schema as EnhancedContextSchemaStructure | null;

    let viewData: Record<string, unknown> = {};

    // Detect if this is an enhanced schema
    const isEnhancedSchema = contextSchema?.roles?.some(role => 
      'linked_tables' in role && role.linked_tables && role.linked_tables.length > 0
    );

    if (isEnhancedSchema && contextSchema) {
      // Use enhanced schema-based data fetching
      viewData = await this.fetchEnhancedData(contextSchema, contextConfig);
    } else {
      // Fallback to legacy simple data fetching for backward compatibility
      viewData = await this.fetchLegacyData(contextConfig);
    }

    // Add metadata
    viewData.generated_at = new Date().toISOString();

    // Render template
    const renderedContent = Mustache.render(templateContent, viewData);
    return renderedContent;
  }

  /**
   * Fetch data using enhanced context schema with linked tables
   */
  private async fetchEnhancedData(
    contextSchema: EnhancedContextSchemaStructure,
    contextConfig: Record<string, { table: string; id: number }>
  ): Promise<Record<string, unknown>> {
    const viewData: Record<string, unknown> = {};

    for (const role of contextSchema.roles) {
      const roleConfig = contextConfig[role.name];
      if (!roleConfig) {
        console.warn(`No context config found for role: ${role.name}`);
        continue;
      }

      try {
        const roleData = await this.queryBuilder.fetchRoleData(role, roleConfig.id);
        viewData[role.name] = roleData;
      } catch (error) {
        console.error(`Error fetching data for role ${role.name}:`, error);
        viewData[role.name] = { error: `Data not found for ${role.name}` };
      }
    }

    return viewData;
  }

  /**
   * Legacy data fetching for backward compatibility
   * This is the original implementation
   */
  private async fetchLegacyData(
    contextConfig: Record<string, { table: string; id: number }>
  ): Promise<Record<string, unknown>> {
    const viewData: Record<string, unknown> = {};

    for (const role in contextConfig) {
      const { table, id } = contextConfig[role];
      const tableName = table as keyof Database['public']['Tables'];

      const { data, error } = await this.supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching data for role '${role}':`, error);
        viewData[role] = { error: `Data not found for ${role}` };
      } else {
        viewData[role] = data;
      }
    }

    return viewData;
  }
}
```

## Phase 4: Template Schema Examples

### 4.1 Customer with Locations Schema

Create this example schema for testing:

**Example Enhanced Context Schema:**

```json
{
  "roles": [
    {
      "name": "customer",
      "label": "Customer",
      "source_table": "c_bpartner",
      "linked_tables": [
        {
          "name": "locations",
          "relationship_type": "one_to_many",
          "join_table": "c_bpartner_location",
          "join_conditions": [
            {
              "local_field": "id",
              "foreign_field": "c_bpartner_id"
            }
          ],
          "target_table": "l_location",
          "target_join": {
            "local_field": "l_location_id",
            "foreign_field": "id"
          },
          "select_fields": ["street_address_1", "street_address_2"],
          "include_join_fields": ["name", "phone", "isbillto", "isshipto"],
          "where_conditions": [
            {
              "field": "is_active",
              "operator": "eq",
              "value": true
            }
          ],
          "order_by": [
            {
              "field": "name",
              "direction": "asc"
            }
          ]
        }
      ]
    }
  ]
}
```

### 4.2 Enhanced Template Example

**Template Content:**

```html
<!DOCTYPE html>
<html>
<head>
    <title>Customer Information</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .location { border: 1px solid #ccc; padding: 10px; margin: 10px 0; }
        .badge { background: #007bff; color: white; padding: 2px 6px; border-radius: 3px; font-size: 12px; }
    </style>
</head>
<body>
    <h1>Customer Information</h1>
    
    <div class="customer-details">
        <h2>Customer Details</h2>
        <p><strong>Name:</strong> {{customer.display_name}}</p>
        <p><strong>Email:</strong> {{customer.email}}</p>
        <p><strong>Customer:</strong> {{#customer.iscustomer}}Yes{{/customer.iscustomer}}{{^customer.iscustomer}}No{{/customer.iscustomer}}</p>
        <p><strong>Vendor:</strong> {{#customer.isvendor}}Yes{{/customer.isvendor}}{{^customer.isvendor}}No{{/customer.isvendor}}</p>
    </div>
    
    <div class="locations-section">
        <h2>Locations ({{customer.locations.length}})</h2>
        
        {{#customer.locations}}
        <div class="location">
            <h3>{{name}}</h3>
            <div class="address">
                <p><strong>Address:</strong></p>
                <p>{{l_location.street_address_1}}</p>
                {{#l_location.street_address_2}}
                <p>{{l_location.street_address_2}}</p>
                {{/l_location.street_address_2}}
            </div>
            
            {{#phone}}
            <p><strong>Phone:</strong> {{phone}}</p>
            {{/phone}}
            
            <div class="location-types">
                {{#isbillto}}<span class="badge">Billing Address</span>{{/isbillto}}
                {{#isshipto}}<span class="badge">Shipping Address</span>{{/isshipto}}
            </div>
        </div>
        {{/customer.locations}}
        
        {{^customer.locations}}
        <p><em>No locations found for this customer.</em></p>
        {{/customer.locations}}
    </div>
    
    <hr>
    <footer>
        <p><small>Generated on: {{generated_at}}</small></p>
    </footer>
</body>
</html>
```

## Phase 5: Testing the Implementation

### 5.1 Test Data Setup

1. **Create a test customer in `c_bpartner`**
2. **Create locations in `l_location`**
3. **Link them through `c_bpartner_location`**

### 5.2 Test Template Creation

1. **Create a new document template** with the enhanced context schema
2. **Use the template content** from the example above
3. **Test document generation** with a customer that has locations

### 5.3 Verification Steps

1. **Verify backward compatibility** - existing templates still work
2. **Verify enhanced features** - new templates show linked data
3. **Verify error handling** - missing data is handled gracefully
4. **Verify performance** - queries are efficient

## Phase 6: UI Enhancements (Future)

### 6.1 Schema Builder UI

Consider creating a visual schema builder that allows users to:
- Select source tables from dropdowns
- Define relationships visually
- Preview available fields
- Validate schema structure

### 6.2 Template Variable Helper

Add a helper that shows available variables based on the schema:
- `{{customer.display_name}}`
- `{{customer.locations}}`
- `{{customer.locations.0.name}}`
- etc.

## Migration Notes

### Backward Compatibility

The enhanced system is designed to be fully backward compatible:

1. **Existing templates** continue to work without changes
2. **Simple context schemas** use the legacy data fetching
3. **Enhanced schemas** are detected automatically
4. **No breaking changes** to existing APIs

### Performance Considerations

1. **Lazy loading** - linked data is only fetched when defined in schema
2. **Efficient queries** - uses Supabase's built-in join capabilities
3. **Error isolation** - failures in linked data don't break main data
4. **Caching opportunities** - can be added later for frequently accessed data

## Conclusion

This implementation provides a powerful, flexible system for accessing related data in document templates while maintaining full backward compatibility. The customer locations example demonstrates the core concepts, but the system can be extended to support any database relationships.