# Enhanced Document Generation System with Linked Table Support

## Overview

This document outlines the design for extending the current document generation system to support linked table data, enabling templates to access related data through joins and nested structures.

## Current System Analysis

### Database Relationships
- `c_bpartner` (customers/partners)
- `c_bpartner_location` (partner locations)
  - `c_bpartner_id` → `c_bpartner.id`
  - `l_location_id` → `l_location.id`
- `l_location` (physical addresses)

### Current Context Schema
```json
{
  "roles": [
    {
      "name": "customer",
      "label": "Customer",
      "source_table": "c_bpartner"
    }
  ]
}
```

### Current Template Usage
```mustache
Customer: {{customer.display_name}}
```

## Enhanced System Design

### 1. Enhanced Context Schema Structure

#### New Schema Format
```typescript
interface EnhancedContextSchemaRole {
  name: string;
  label: string;
  source_table: string;
  linked_tables?: LinkedTableDefinition[];
}

interface LinkedTableDefinition {
  name: string;                    // Property name in template data
  relationship_type: 'one_to_one' | 'one_to_many' | 'many_to_many';
  join_table?: string;             // Intermediate table for joins
  join_conditions: JoinCondition[];
  target_table?: string;           // Final target table
  target_join?: JoinCondition;     // Join to target table
  select_fields: string[];         // Fields to select from target
  include_join_fields?: string[];  // Fields from join table
  where_conditions?: WhereCondition[];
  order_by?: OrderByClause[];
}

interface JoinCondition {
  local_field: string;
  foreign_field: string;
}

interface WhereCondition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in';
  value: any;
}

interface OrderByClause {
  field: string;
  direction: 'asc' | 'desc';
}
```

#### Example Enhanced Schema
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

### 2. Enhanced Template Usage

With the enhanced schema, templates can access nested data:

```mustache
Customer: {{customer.display_name}}

{{#customer.locations}}
Location: {{name}}
Address: {{street_address_1}}
{{#street_address_2}}
{{street_address_2}}
{{/street_address_2}}
Phone: {{phone}}
{{#isbillto}}✓ Billing Address{{/isbillto}}
{{#isshipto}}✓ Shipping Address{{/isshipto}}
---
{{/customer.locations}}

{{^customer.locations}}
No locations found for this customer.
{{/customer.locations}}
```

### 3. Implementation Components

#### 3.1 Enhanced Zod Schemas

File: `src/lib/types/supabase.zod.schemas.ts`

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

// Enhanced context schema role
export const enhancedContextSchemaRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  label: z.string().min(1, 'Role label is required'),
  source_table: z.string().min(1, 'Source table is required'),
  linked_tables: z.array(linkedTableDefinitionSchema).optional()
});

// Enhanced context schema structure
export const enhancedContextSchemaStructureSchema = z.object({
  roles: z.array(enhancedContextSchemaRoleSchema).min(1, 'At least one role is required')
});

// Export types
export type JoinCondition = z.infer<typeof joinConditionSchema>;
export type WhereCondition = z.infer<typeof whereConditionSchema>;
export type OrderByClause = z.infer<typeof orderByClauseSchema>;
export type LinkedTableDefinition = z.infer<typeof linkedTableDefinitionSchema>;
export type EnhancedContextSchemaRole = z.infer<typeof enhancedContextSchemaRoleSchema>;
export type EnhancedContextSchemaStructure = z.infer<typeof enhancedContextSchemaStructureSchema>;
```

#### 3.2 Enhanced Query Builder

File: `src/lib/services/enhanced-query.builder.ts`

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
   */
  private async fetchLinkedTableData(
    sourceTable: string,
    entityId: number,
    linkedTable: LinkedTableDefinition
  ): Promise<any[]> {
    try {
      // Build the select clause
      const selectFields = this.buildSelectClause(linkedTable);
      
      // Start with the join table or target table
      const queryTable = linkedTable.join_table || linkedTable.target_table || sourceTable;
      
      let query = this.supabase.from(queryTable as any).select(selectFields);

      // Apply join conditions
      for (const joinCondition of linkedTable.join_conditions) {
        if (joinCondition.local_field === 'id' && sourceTable) {
          // Join to source table
          query = query.eq(joinCondition.foreign_field, entityId);
        }
      }

      // Apply where conditions
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
   * Build select clause for complex joins
   */
  private buildSelectClause(linkedTable: LinkedTableDefinition): string {
    const fields: string[] = [];

    // Add fields from join table
    if (linkedTable.include_join_fields) {
      fields.push(...linkedTable.include_join_fields);
    }

    // Add fields from target table
    if (linkedTable.target_table && linkedTable.select_fields) {
      const targetFields = linkedTable.select_fields.map(
        field => `${linkedTable.target_table}(${field})`
      );
      fields.push(...targetFields);
    } else if (linkedTable.select_fields) {
      fields.push(...linkedTable.select_fields);
    }

    return fields.length > 0 ? fields.join(', ') : '*';
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

#### 3.3 Enhanced Document Generation Service

File: `src/lib/services/enhanced-document-generation.service.ts`

```typescript
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Tables } from '@tihomir971/assist-shared';
import type { EnhancedContextSchemaStructure } from '$lib/types/supabase.zod.schemas';
import { EnhancedQueryBuilder } from './enhanced-query.builder';
import Mustache from 'mustache';

type DocGeneratedDocument = Tables<'doc_generated_document'> & {
  doc_template: Tables<'doc_template'> | null;
};

export class EnhancedDocumentGenerationService {
  private queryBuilder: EnhancedQueryBuilder;

  constructor(private supabase: SupabaseClient<Database>) {
    this.queryBuilder = new EnhancedQueryBuilder(supabase);
  }

  /**
   * Generate document content with enhanced linked table support
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

    if (contextSchema?.roles) {
      // Use enhanced schema-based data fetching
      viewData = await this.fetchEnhancedData(contextSchema, contextConfig);
    } else {
      // Fallback to legacy simple data fetching
      viewData = await this.fetchLegacyData(contextConfig);
    }

    // Add metadata
    viewData.generated_at = new Date().toISOString();

    // Render template
    const renderedContent = Mustache.render(templateContent, viewData);
    return renderedContent;
  }

  /**
   * Fetch data using enhanced context schema
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

### 4. Migration Strategy

#### 4.1 Backward Compatibility
- Existing simple context schemas continue to work
- Legacy templates remain functional
- Gradual migration path for enhanced features

#### 4.2 Enhanced Schema Detection
```typescript
// In the service, detect schema type
const isEnhancedSchema = contextSchema?.roles?.some(role => role.linked_tables);

if (isEnhancedSchema) {
  // Use enhanced data fetching
  viewData = await this.fetchEnhancedData(contextSchema, contextConfig);
} else {
  // Use legacy data fetching
  viewData = await this.fetchLegacyData(contextConfig);
}
```

### 5. Usage Examples

#### 5.1 Customer with Locations Template
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
          ]
        }
      ]
    }
  ]
}
```

#### 5.2 Template Content
```mustache
<!DOCTYPE html>
<html>
<head>
    <title>Customer Information</title>
</head>
<body>
    <h1>Customer Details</h1>
    <p><strong>Name:</strong> {{customer.display_name}}</p>
    <p><strong>Email:</strong> {{customer.email}}</p>
    
    <h2>Locations</h2>
    {{#customer.locations}}
    <div class="location">
        <h3>{{name}}</h3>
        <p><strong>Address:</strong> {{l_location.street_address_1}}</p>
        {{#l_location.street_address_2}}
        <p>{{l_location.street_address_2}}</p>
        {{/l_location.street_address_2}}
        <p><strong>Phone:</strong> {{phone}}</p>
        <p>
            {{#isbillto}}✓ Billing Address{{/isbillto}}
            {{#isshipto}}✓ Shipping Address{{/isshipto}}
        </p>
    </div>
    {{/customer.locations}}
    
    {{^customer.locations}}
    <p>No locations found for this customer.</p>
    {{/customer.locations}}
    
    <hr>
    <p><small>Generated on: {{generated_at}}</small></p>
</body>
</html>
```

### 6. Testing Strategy

#### 6.1 Unit Tests
- Test enhanced query builder with various join scenarios
- Test schema validation with complex nested structures
- Test backward compatibility with existing schemas

#### 6.2 Integration Tests
- Test complete document generation flow
- Test with real database relationships
- Test error handling for missing data

#### 6.3 Performance Tests
- Test query performance with complex joins
- Test memory usage with large datasets
- Test template rendering performance

### 7. Future Enhancements

#### 7.1 Advanced Features
- Support for many-to-many relationships
- Conditional data fetching based on template content
- Caching for frequently accessed data
- Support for aggregated data (counts, sums, etc.)

#### 7.2 UI Improvements
- Visual schema builder for non-technical users
- Template preview with real data
- Schema validation and error reporting
- Auto-completion for template variables

## Implementation Checklist

- [ ] Create enhanced Zod schemas for linked tables
- [ ] Implement EnhancedQueryBuilder class
- [ ] Update DocumentGenerationService with enhanced features
- [ ] Add backward compatibility layer
- [ ] Create migration utilities
- [ ] Update UI components for enhanced schema editing
- [ ] Add comprehensive tests
- [ ] Update documentation and examples
- [ ] Performance optimization and caching
- [ ] Error handling and validation improvements

## Conclusion

This enhanced document generation system provides powerful capabilities for accessing related data through complex joins while maintaining backward compatibility with existing templates. The flexible schema structure allows for various relationship types and query patterns, making it suitable for complex business document requirements.