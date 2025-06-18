# Pricing Rules CRUD Implementation Plan

## 🎯 Cilj
Implementacija osnovne CRUD funkcionalnosti za cenovne formule sa navigacijom na novu stranicu.

## 📁 Struktura fajlova

```
src/routes/(app)/crm/pricing-rules/
├── +page.server.ts              # Lista svih pravila
├── +page.svelte                 # Tabela sa action buttons
├── columns.ts                   # Definicija kolona za tabelu
├── pricing-rules.zod.ts         # Zod schemes
├── [[id]]/                      # Dynamic route za create/edit
│   ├── +page.server.ts          # CRUD actions i load
│   ├── +page.svelte             # SmartForm za create/edit
│   ├── +layout@(app).svelte     # Custom layout
│   └── pricing-rules.payload.ts # Payload builder
```

## 🔧 Implementacijski koraci

### 1. Zod Schema (`pricing-rules.zod.ts`)

```typescript
import { z } from 'zod';

export const pricingRuleInsertSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Ime je obavezno"),
  conditions: z.record(z.unknown()).default({}),
  formula: z.record(z.unknown()),
  priority: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
  target_group: z.string().optional(),
  starts_at: z.string().optional(),
  ends_at: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

export const pricingRuleUpdateSchema = pricingRuleInsertSchema.partial();

export type PricingRuleFormData = z.infer<typeof pricingRuleInsertSchema>;
```

### 2. Kolone za tabelu (`columns.ts`)

```typescript
export const pricingRulesColumns = [
  {
    key: 'name',
    label: 'Ime pravila',
    sortable: true,
    className: 'font-medium'
  },
  {
    key: 'priority',
    label: 'Prioritet',
    sortable: true,
    className: 'text-center w-24'
  },
  {
    key: 'is_active',
    label: 'Aktivno',
    type: 'boolean',
    className: 'text-center w-20'
  },
  {
    key: 'target_group',
    label: 'Grupa',
    optional: true,
    className: 'text-muted-foreground'
  },
  {
    key: 'created_at',
    label: 'Kreiran',
    type: 'date',
    className: 'text-sm text-muted-foreground w-32'
  },
  {
    key: 'actions',
    label: 'Akcije',
    type: 'actions',
    className: 'text-right w-24'
  }
];
```

### 3. Lista stranica (`+page.server.ts`)

```typescript
import type { PageServerLoad, Actions } from './$types';
import { PricingRulesService } from '$lib/services/supabase/pricing-rules.service';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  try {
    const service = new PricingRulesService(supabase);
    const rules = await service.list();
    
    return {
      rules
    };
  } catch (error) {
    console.error('Error loading pricing rules:', error);
    return {
      rules: []
    };
  }
};

export const actions: Actions = {
  delete: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const id = formData.get('id');
    
    if (!id || isNaN(Number(id))) {
      return fail(400, { error: 'Invalid ID' });
    }
    
    try {
      const service = new PricingRulesService(supabase);
      await service.delete(Number(id));
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting pricing rule:', error);
      return fail(500, { error: 'Failed to delete pricing rule' });
    }
  }
};
```

### 4. Lista komponenta (`+page.svelte`)

```svelte
<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { enhance } from '$app/forms';
  import { toast } from 'svelte-sonner';
  
  // UI Components
  import { Button } from '$lib/components/ui/button/index.js';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table/index.js';
  import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '$lib/components/ui/dropdown-menu/index.js';
  
  // Icons
  import { Plus, MoreHorizontal, Edit, Trash2, Copy } from 'lucide-svelte';
  
  import type { PageData } from './$types';
  import { pricingRulesColumns } from './columns';
  
  let { data }: { data: PageData } = $props();
  
  function handleEdit(id: number) {
    goto(`/crm/pricing-rules/${id}`);
  }
  
  function handleCreate() {
    goto('/crm/pricing-rules/create');
  }
  
  function handleClone(rule: any) {
    // TODO: Implement clone functionality
    toast.info('Clone funkcionalnost će biti dodana uskoro');
  }
  
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('sr-RS');
  }
  
  function formatFormula(formula: any) {
    if (!formula || typeof formula !== 'object') return 'N/A';
    return formula.type || 'Unknown';
  }
</script>

<div class="container mx-auto py-6">
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Cenovne formule</h1>
      <p class="text-muted-foreground">
        Upravljanje pravilima za automatsko računanje cena
      </p>
    </div>
    <Button onclick={handleCreate} class="gap-2">
      <Plus class="h-4 w-4" />
      Novo pravilo
    </Button>
  </div>

  <Card>
    <CardHeader>
      <CardTitle>Sva pravila ({data.rules.length})</CardTitle>
    </CardHeader>
    <CardContent>
      {#if data.rules.length === 0}
        <div class="text-center py-8">
          <p class="text-muted-foreground mb-4">Nema definisanih pravila</p>
          <Button onclick={handleCreate} variant="outline" class="gap-2">
            <Plus class="h-4 w-4" />
            Kreiraj prvo pravilo
          </Button>
        </div>
      {:else}
        <Table>
          <TableHeader>
            <TableRow>
              {#each pricingRulesColumns as column}
                <TableHead class={column.className || ''}>
                  {column.label}
                </TableHead>
              {/each}
            </TableRow>
          </TableHeader>
          <TableBody>
            {#each data.rules as rule}
              <TableRow>
                <TableCell class="font-medium">
                  <button 
                    onclick={() => handleEdit(rule.id)}
                    class="text-left hover:underline"
                  >
                    {rule.name}
                  </button>
                </TableCell>
                <TableCell class="text-center">
                  <Badge variant="secondary">{rule.priority}</Badge>
                </TableCell>
                <TableCell class="text-center">
                  <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                    {rule.is_active ? 'Aktivno' : 'Neaktivno'}
                  </Badge>
                </TableCell>
                <TableCell class="text-muted-foreground">
                  {rule.target_group || '-'}
                </TableCell>
                <TableCell class="text-sm text-muted-foreground">
                  {formatDate(rule.created_at)}
                </TableCell>
                <TableCell class="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild let:builder>
                      <Button builders={[builder]} variant="ghost" class="h-8 w-8 p-0">
                        <MoreHorizontal class="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onclick={() => handleEdit(rule.id)} class="gap-2">
                        <Edit class="h-4 w-4" />
                        Edituj
                      </DropdownMenuItem>
                      <DropdownMenuItem onclick={() => handleClone(rule)} class="gap-2">
                        <Copy class="h-4 w-4" />
                        Kloniraj
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        class="gap-2 text-destructive focus:text-destructive"
                        onclick={() => {
                          if (confirm('Da li ste sigurni da želite da obrišete ovo pravilo?')) {
                            // TODO: Implement delete
                          }
                        }}
                      >
                        <Trash2 class="h-4 w-4" />
                        Obriši
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            {/each}
          </TableBody>
        </Table>
      {/if}
    </CardContent>
  </Card>
</div>
```

### 5. Payload Builder (`[[id]]/pricing-rules.payload.ts`)

```typescript
import { SmartPayloadBuilder } from '$lib/utils/smart-payload.builder';
import { pricingRuleInsertSchema, pricingRuleUpdateSchema } from '../pricing-rules.zod';
import type { PricingRuleCreate, PricingRuleUpdate } from '$lib/types/pricing-rules.types';

export const pricingRulesPayloadBuilder = new SmartPayloadBuilder<
  PricingRuleCreate,
  PricingRuleUpdate
>(
  {
    schema: pricingRuleInsertSchema,
    defaults: {
      is_active: true,
      priority: 0,
      conditions: {},
      formula: { type: 'markup_cost', value: 1.2 }
    },
    transformers: {
      conditions: (value) => {
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch {
            return {};
          }
        }
        return value || {};
      },
      formula: (value) => {
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch {
            return { type: 'markup_cost', value: 1.2 };
          }
        }
        return value;
      },
      priority: (value) => {
        const num = Number(value);
        return isNaN(num) ? 0 : num;
      }
    }
  },
  {
    schema: pricingRuleUpdateSchema,
    transformers: {
      conditions: (value) => {
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch {
            return {};
          }
        }
        return value;
      },
      formula: (value) => {
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch {
            return { type: 'markup_cost', value: 1.2 };
          }
        }
        return value;
      }
    }
  }
);
```

### 6. CRUD Server Actions (`[[id]]/+page.server.ts`)

```typescript
import type { PageServerLoad, Actions } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { error } from '@sveltejs/kit';
import { PricingRulesService } from '$lib/services/supabase/pricing-rules.service';
import { createSimpleCRUD } from '$lib/utils/simple-crud.factory';
import { pricingRuleInsertSchema } from '../pricing-rules.zod';
import { pricingRulesPayloadBuilder } from './pricing-rules.payload';
import type { PricingRule } from '$lib/types/pricing-rules.types';

export const load: PageServerLoad = async ({ params, locals: { supabase } }) => {
  const service = new PricingRulesService(supabase);
  
  let rule: PricingRule | null = null;
  let isCreateMode = true;
  
  if (params.id && params.id !== 'create') {
    const ruleId = parseInt(params.id);
    if (isNaN(ruleId)) {
      throw error(400, 'Invalid rule ID');
    }
    
    rule = await service.getById(ruleId);
    if (!rule) {
      throw error(404, 'Pricing rule not found');
    }
    isCreateMode = false;
  }
  
  return {
    rule,
    isCreateMode,
    formPricingRule: await superValidate(rule, zod(pricingRuleInsertSchema))
  };
};

// Create CRUD actions using the factory
const pricingRulesActions = createSimpleCRUD<PricingRule, typeof pricingRuleInsertSchema>(
  'PricingRule',
  (supabase) => new PricingRulesService(supabase),
  pricingRulesPayloadBuilder,
  pricingRuleInsertSchema,
  '/crm/pricing-rules'
);

export const actions: Actions = {
  upsert: pricingRulesActions.upsert,
  delete: pricingRulesActions.delete
};
```

### 7. CRUD Form komponenta (`[[id]]/+page.svelte`)

```svelte
<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { toast } from 'svelte-sonner';
  
  // Enhanced Form Components
  import SmartForm from '$lib/components/forms/SmartForm.svelte';
  import { createFormConfig } from '$lib/utils/form-config.builder';
  import { pricingRuleInsertSchema } from '../pricing-rules.zod';
  import type { PricingRuleFormData } from '../pricing-rules.zod';
  
  // UI Components
  import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
  import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '$lib/components/ui/breadcrumb/index.js';
  
  import type { PageData } from './$types';
  
  let { data }: { data: PageData } = $props();
  
  // Enhanced SmartForm configuration
  const pricingRuleFormConfig = createFormConfig<PricingRuleFormData>()
    .title(data.isCreateMode ? 'Novo cenovno pravilo' : 'Edituj cenovno pravilo')
    .description(
      data.isCreateMode 
        ? 'Kreiraj novo pravilo za automatsko računanje cena' 
        : 'Ažuriraj postojeće cenovno pravilo'
    )
    .cardProps({
      className: 'max-w-4xl mx-auto',
      showHeader: true,
      showFooter: false
    })
    .gap('md')
    // Basic fields
    .field('id', {
      span: 3,
      label: 'ID',
      readonly: true,
      hidden: data.isCreateMode
    })
    .field('name', {
      span: 9,
      placeholder: 'Unesite naziv pravila...',
      description: 'Jedinstveno ime za ovo cenovno pravilo'
    })
    .field('priority', {
      span: 4,
      type: 'number',
      placeholder: '0',
      description: 'Manji broj = veći prioritet'
    })
    .field('is_active', {
      span: 4,
      label: 'Aktivno',
      description: 'Da li je pravilo trenutno aktivno'
    })
    .field('target_group', {
      span: 4,
      placeholder: 'wholesale, retail...',
      description: 'Ciljna grupa kupaca (opciono)'
    })
    // JSON fields (simplified for now)
    .field('conditions', {
      span: 12,
      type: 'textarea',
      placeholder: '{}',
      description: 'JSON objekat sa uslovima (kategorije, atributi, količina...)'
    })
    .field('formula', {
      span: 12,
      type: 'textarea', 
      placeholder: '{"type": "markup_cost", "value": 1.2}',
      description: 'JSON objekat sa formulom za računanje cene'
    })
    // Date fields
    .field('starts_at', {
      span: 6,
      type: 'datetime-local',
      label: 'Važi od',
      description: 'Kada pravilo počinje da važi (opciono)'
    })
    .field('ends_at', {
      span: 6,
      type: 'datetime-local',
      label: 'Važi do',
      description: 'Kada pravilo prestaje da važi (opciono)'
    })
    // Timestamps
    .field('created_at', {
      span: 6,
      type: 'datetime-local',
      label: 'Kreirano',
      readonly: true,
      hidden: data.isCreateMode
    })
    .field('updated_at', {
      span: 6,
      type: 'datetime-local',
      label: 'Ažurirano',
      readonly: true,
      hidden: data.isCreateMode
    })
    .build();
  
  // Success handler
  function handleSuccess(formData: any) {
    const wasCreateMode = data.isCreateMode;
    
    if (wasCreateMode && formData.id) {
      toast.success('Cenovno pravilo je uspešno kreirano', {
        description: 'Novo pravilo je sačuvano u bazi.'
      });
      // Navigate to edit mode after creation
      setTimeout(() => {
        goto(`/crm/pricing-rules/${formData.id}`, { replaceState: true });
      }, 500);
    } else {
      toast.success('Cenovno pravilo je uspešno ažurirano', {
        description: 'Izmene su sačuvane.'
      });
    }
  }
  
  // Error handler
  function handleError(error: string | null) {
    toast.error(
      data.isCreateMode ? 'Greška pri kreiranju pravila' : 'Greška pri ažuriranju pravila',
      {
        description: error || 'Molimo proverite formu za greške'
      }
    );
  }
  
  // Cancel handler
  function handleCancel() {
    goto('/crm/pricing-rules');
  }
  
  // Delete handler
  function handleDelete() {
    if (confirm('Da li ste sigurni da želite da obrišete ovo pravilo?')) {
      console.log('Delete initiated for rule:', data.rule?.id);
    }
  }
</script>

<div class="container mx-auto py-6">
  <!-- Breadcrumb -->
  <Breadcrumb class="mb-6">
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href="/crm">CRM</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbLink href="/crm/pricing-rules">Cenovne formule</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage>
          {data.isCreateMode ? 'Novo pravilo' : data.rule?.name || 'Edituj'}
        </BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>

  <!-- Main Form -->
  <div class="mx-auto h-full overflow-hidden">
    <ScrollArea class="h-full">
      <SmartForm
        form={data.formPricingRule}
        schema={pricingRuleInsertSchema}
        action="?/upsert"
        entityName="PricingRule"
        config={pricingRuleFormConfig}
        onSuccess={handleSuccess}
        onError={handleError}
        onCancel={handleCancel}
        onDelete={handleDelete}
        deleteAction="?/delete"
        showDelete={!data.isCreateMode}
      />
    </ScrollArea>
  </div>
</div>
```

### 8. Custom Layout (`[[id]]/+layout@(app).svelte`)

```svelte
<script lang="ts">
  let { children } = $props();
</script>

<div class="min-h-screen bg-background">
  {@render children()}
</div>
```

## 🎯 Rezultat

Ova implementacija će kreirati:

1. **Lista stranica** (`/crm/pricing-rules`) - Tabela sa svim pravilima
2. **Kreiranje** (`/crm/pricing-rules/create`) - Nova forma
3. **Editovanje** (`/crm/pricing-rules/[id]`) - Editovanje postojećeg

### Funkcionalnosti:
- ✅ CRUD operacije (Create, Read, Update, Delete)
- ✅ Type-safe forme sa Zod validacijom
- ✅ SmartForm integracija
- ✅ Shadcn-svelte komponente
- ✅ Responsive design
- ✅ Toast notifikacije
- ✅ Breadcrumb navigacija
- ✅ Action buttons u tabeli

### Sledeći koraci:
1. Implementirati ove fajlove
2. Testirati osnovnu funkcionalnost
3. Dodati naprednije funkcionalnosti postupno

## 🚀 Spremno za implementaciju!

Sada treba da prebacim u Code mod i kreiram sve ove fajlove.