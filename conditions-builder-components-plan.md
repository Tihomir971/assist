# Conditions Builder Components Implementation Plan

## 🎯 Cilj
Kreirati strukturirane UI komponente za uređivanje conditions JSON-a umesto raw JSON unosa.

## 📋 Struktura komponenti

```
src/lib/components/pricing-rules/
├── builders/
│   ├── FormulaBuilder.svelte ✅
│   └── ConditionsBuilder.svelte
├── condition-types/
│   ├── AttributesConditionBuilder.svelte
│   ├── CategoriesSelector.svelte
│   ├── PartnersSelector.svelte
│   └── QuantityRangeInputs.svelte
└── formula-types/ ✅ (već kreirano)
```

## 🔧 Struktura Conditions JSON-a (iz UPUTSTVA)

```json
{
  "attributes": [
    {
      "attribute_id": 5,        // ID atributa (brend)
      "type": "options",        // tip: "options" ili "number"
      "option_ids": [25]        // Samsung (ID opcije)
    },
    {
      "attribute_id": 7,        // ID atributa (dijagonala)
      "type": "options",
      "option_ids": [50, 55, 65, 75]  // 50", 55", 65", 75"
    }
  ],
  "category_ids": [1, 2, 3],    // ID-jevi kategorija
  "partner_ids": [123, 456],    // specifični partneri
  "min_quantity": 10,           // minimum 10 komada
  "max_quantity": 100,          // maksimum 100 komada
  "min_order_value": 500        // minimalna vrednost narudžbe
}
```

## 🏗️ Implementacija komponenti

### 1. ConditionsBuilder.svelte - Glavna komponenta

```typescript
interface ConditionsBuilderProps {
  conditions: PricingConditions;
  lookupData: {
    partners: PartnerLookup[];
    categories: CategoryLookup[];
    attributes: AttributeLookup[];
  };
  onConditionsChange: (conditions: PricingConditions) => void;
}
```

**Funkcionalnost:**
- Organizuje sve pod-komponente u logičke sekcije
- Prosleđuje lookup podatke pod-komponentama
- Agregira izmene iz pod-komponenti

### 2. AttributesConditionBuilder.svelte - Najkompleksnija

```typescript
interface AttributesConditionBuilderProps {
  attributes: AttributeCondition[];
  attributesLookup: AttributeLookup[];
  onAttributesChange: (attributes: AttributeCondition[]) => void;
}
```

**Funkcionalnost:**
- Lista AttributeConditionItem komponenti
- Add/Remove dugmad za atribute
- Svaki item ima:
  - Select za attribute_id (iz lookup podataka)
  - Radio buttons za type ("options" ili "number")
  - Za "options": Multiple select sa opcijama atributa
  - Za "number": Number inputs za min/max/exact vrednosti

### 3. CategoriesSelector.svelte

```typescript
interface CategoriesSelectorProps {
  selectedCategoryIds: number[];
  categoriesLookup: CategoryLookup[];
  onCategoriesChange: (categoryIds: number[]) => void;
}
```

**Koristi:** [`SmartSelect`](src/lib/components/forms/fields/SmartSelect.svelte) sa `type="multiple"`

### 4. PartnersSelector.svelte

```typescript
interface PartnersSelectorProps {
  selectedPartnerIds: number[];
  partnersLookup: PartnerLookup[];
  onPartnersChange: (partnerIds: number[]) => void;
}
```

**Koristi:** [`SmartSelect`](src/lib/components/forms/fields/SmartSelect.svelte) sa `type="multiple"`

### 5. QuantityRangeInputs.svelte

```typescript
interface QuantityRangeInputsProps {
  minQuantity?: number;
  maxQuantity?: number;
  minOrderValue?: number;
  onQuantityChange: (updates: {
    min_quantity?: number;
    max_quantity?: number;
    min_order_value?: number;
  }) => void;
}
```

**UI polja:**
- `min_quantity` - Number input
- `max_quantity` - Number input  
- `min_order_value` - Number input

## 📊 Implementacijski detalji

### ConditionsBuilder.svelte

```svelte
<script lang="ts">
  import type { PricingConditions } from '$lib/types/pricing-rules.types';
  import * as Card from '$lib/components/ui/card';
  
  import AttributesConditionBuilder from '../condition-types/AttributesConditionBuilder.svelte';
  import CategoriesSelector from '../condition-types/CategoriesSelector.svelte';
  import PartnersSelector from '../condition-types/PartnersSelector.svelte';
  import QuantityRangeInputs from '../condition-types/QuantityRangeInputs.svelte';
  
  interface Props {
    conditions: PricingConditions;
    lookupData: {
      partners: { value: number; label: string }[];
      categories: { value: number; label: string }[];
      attributes: { value: number; label: string }[];
    };
    onConditionsChange: (conditions: PricingConditions) => void;
  }
  
  let { conditions, lookupData, onConditionsChange }: Props = $props();
  
  function updateConditions(updates: Partial<PricingConditions>) {
    onConditionsChange({ ...conditions, ...updates });
  }
</script>

<div class="space-y-6">
  <!-- Categories Section -->
  <Card.Root>
    <Card.Header>
      <Card.Title>Kategorije proizvoda</Card.Title>
    </Card.Header>
    <Card.Content>
      <CategoriesSelector
        selectedCategoryIds={conditions.category_ids || []}
        categoriesLookup={lookupData.categories}
        onCategoriesChange={(categoryIds) => updateConditions({ category_ids: categoryIds })}
      />
    </Card.Content>
  </Card.Root>

  <!-- Partners Section -->
  <Card.Root>
    <Card.Header>
      <Card.Title>Partneri</Card.Title>
    </Card.Header>
    <Card.Content>
      <PartnersSelector
        selectedPartnerIds={conditions.partner_ids || []}
        partnersLookup={lookupData.partners}
        onPartnersChange={(partnerIds) => updateConditions({ partner_ids: partnerIds })}
      />
    </Card.Content>
  </Card.Root>

  <!-- Attributes Section -->
  <Card.Root>
    <Card.Header>
      <Card.Title>Atributi proizvoda</Card.Title>
    </Card.Header>
    <Card.Content>
      <AttributesConditionBuilder
        attributes={conditions.attributes || []}
        attributesLookup={lookupData.attributes}
        onAttributesChange={(attributes) => updateConditions({ attributes })}
      />
    </Card.Content>
  </Card.Root>

  <!-- Quantity & Order Value Section -->
  <Card.Root>
    <Card.Header>
      <Card.Title>Količina i vrednost narudžbe</Card.Title>
    </Card.Header>
    <Card.Content>
      <QuantityRangeInputs
        minQuantity={conditions.min_quantity}
        maxQuantity={conditions.max_quantity}
        minOrderValue={conditions.min_order_value}
        onQuantityChange={(updates) => updateConditions(updates)}
      />
    </Card.Content>
  </Card.Root>
</div>
```

### AttributesConditionBuilder.svelte - Najkompleksnija

```svelte
<script lang="ts">
  import type { AttributeCondition } from '$lib/types/pricing-rules.types';
  import { Button } from '$lib/components/ui/button';
  import * as Select from '$lib/components/ui/select';
  import { Label } from '$lib/components/ui/label';
  import { Input } from '$lib/components/ui/input';
  import { SmartSelect } from '$lib/components/forms/fields/SmartSelect.svelte';
  import Plus from '@lucide/svelte/icons/plus';
  import Trash2 from '@lucide/svelte/icons/trash-2';
  
  interface Props {
    attributes: AttributeCondition[];
    attributesLookup: { value: number; label: string }[];
    onAttributesChange: (attributes: AttributeCondition[]) => void;
  }
  
  let { attributes, attributesLookup, onAttributesChange }: Props = $props();
  
  function addAttribute() {
    const newAttribute: AttributeCondition = {
      attribute_id: 0,
      type: 'options',
      option_ids: []
    };
    onAttributesChange([...attributes, newAttribute]);
  }
  
  function removeAttribute(index: number) {
    const newAttributes = attributes.filter((_, i) => i !== index);
    onAttributesChange(newAttributes);
  }
  
  function updateAttribute(index: number, updates: Partial<AttributeCondition>) {
    const newAttributes = attributes.map((attr, i) => 
      i === index ? { ...attr, ...updates } : attr
    );
    onAttributesChange(newAttributes);
  }
  
  // Load attribute options when attribute_id changes
  async function loadAttributeOptions(attributeId: number) {
    // Call AttributeService.getAttributeOptions(attributeId)
    // This will be implemented when integrating with the service
    return [];
  }
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <Label>Uslovi za atribute</Label>
    <Button variant="outline" size="sm" onclick={addAttribute}>
      <Plus class="h-4 w-4 mr-2" />
      Dodaj atribut
    </Button>
  </div>
  
  {#if attributes.length === 0}
    <p class="text-sm text-muted-foreground italic">Nema definisanih uslova za atribute.</p>
  {/if}
  
  <div class="space-y-4">
    {#each attributes as attribute, index (index)}
      <div class="border rounded-lg p-4 space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-medium">Atribut {index + 1}</h4>
          <Button 
            variant="ghost" 
            size="icon" 
            onclick={() => removeAttribute(index)}
            title="Ukloni atribut"
          >
            <Trash2 class="h-4 w-4" />
          </Button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Attribute Selection -->
          <div class="space-y-2">
            <Label>Atribut</Label>
            <Select.Root
              type="single"
              value={String(attribute.attribute_id)}
              onValueChange={(v) => updateAttribute(index, { 
                attribute_id: Number(v), 
                option_ids: [] // Reset options when attribute changes
              })}
            >
              <Select.Trigger>
                {attributesLookup.find(a => a.value === attribute.attribute_id)?.label || 'Izaberite atribut'}
              </Select.Trigger>
              <Select.Content>
                {#each attributesLookup as attr}
                  <Select.Item value={String(attr.value)}>{attr.label}</Select.Item>
                {/each}
              </Select.Content>
            </Select.Root>
          </div>
          
          <!-- Type Selection -->
          <div class="space-y-2">
            <Label>Tip uslova</Label>
            <Select.Root
              type="single"
              value={attribute.type}
              onValueChange={(v) => updateAttribute(index, { type: v as 'options' | 'number' })}
            >
              <Select.Trigger>
                {attribute.type === 'options' ? 'Opcije' : 'Numerička vrednost'}
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="options">Opcije</Select.Item>
                <Select.Item value="number">Numerička vrednost</Select.Item>
              </Select.Content>
            </Select.Root>
          </div>
        </div>
        
        <!-- Condition Value Inputs -->
        {#if attribute.type === 'options'}
          <div class="space-y-2">
            <Label>Opcije atributa</Label>
            <!-- This will use SmartSelect with options loaded from AttributeService -->
            <p class="text-xs text-muted-foreground">
              Implementirati multiple select sa opcijama atributa
            </p>
          </div>
        {:else if attribute.type === 'number'}
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="space-y-2">
              <Label>Min. vrednost</Label>
              <Input
                type="number"
                value={attribute.min_value || ''}
                onchange={(e) => updateAttribute(index, { 
                  min_value: e.currentTarget.value ? Number(e.currentTarget.value) : undefined 
                })}
              />
            </div>
            <div class="space-y-2">
              <Label>Max. vrednost</Label>
              <Input
                type="number"
                value={attribute.max_value || ''}
                onchange={(e) => updateAttribute(index, { 
                  max_value: e.currentTarget.value ? Number(e.currentTarget.value) : undefined 
                })}
              />
            </div>
            <div class="space-y-2">
              <Label>Tačna vrednost</Label>
              <Input
                type="number"
                value={attribute.exact_value || ''}
                onchange={(e) => updateAttribute(index, { 
                  exact_value: e.currentTarget.value ? Number(e.currentTarget.value) : undefined 
                })}
              />
            </div>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
```

### CategoriesSelector.svelte

```svelte
<script lang="ts">
  import { SmartSelect } from '$lib/components/forms/fields/SmartSelect.svelte';
  
  interface Props {
    selectedCategoryIds: number[];
    categoriesLookup: { value: number; label: string }[];
    onCategoriesChange: (categoryIds: number[]) => void;
  }
  
  let { selectedCategoryIds, categoriesLookup, onCategoriesChange }: Props = $props();
  
  const fieldConfig = {
    name: 'category_ids',
    label: 'Kategorije',
    type: 'number' as const,
    placeholder: 'Izaberite kategorije...',
    options: categoriesLookup
  };
</script>

<SmartSelect
  field={fieldConfig}
  bind:value={selectedCategoryIds}
  onchange={() => onCategoriesChange(selectedCategoryIds)}
/>
<p class="text-xs text-muted-foreground mt-2">
  Pravilo će se primeniti samo na proizvode iz izabranih kategorija.
</p>
```

## 🔄 Integracija sa glavnom formom

U [`+page.svelte`](src/routes/(app)/crm/pricing-rules/[id]/+page.svelte):

```svelte
<script>
  import ConditionsBuilder from '$lib/components/pricing-rules/builders/ConditionsBuilder.svelte';
  
  // Parse existing conditions
  let parsedConditions = $derived(() => {
    try {
      if (typeof $formData.conditions === 'string' && $formData.conditions.trim() !== '') {
        return JSON.parse($formData.conditions) as PricingConditions;
      } else if (typeof $formData.conditions === 'object' && $formData.conditions !== null) {
        return $formData.conditions as PricingConditions;
      }
      return {} as PricingConditions;
    } catch (e) {
      console.warn('Failed to parse conditions JSON:', $formData.conditions, e);
      return {} as PricingConditions;
    }
  });
  
  function handleConditionsChange(newConditions: PricingConditions) {
    $formData.conditions = JSON.stringify(newConditions);
  }
</script>

<!-- Umesto postojećeg Textarea -->
<ConditionsBuilder 
  conditions={parsedConditions()}
  lookupData={data.lookupData}
  onConditionsChange={handleConditionsChange}
/>
```

## ✅ Sledeći koraci

1. **Kreirati ConditionsBuilder.svelte** - glavna komponenta
2. **Kreirati pod-komponente** - 4 komponente
3. **Integrisati u glavnu formu** - zameniti Textarea
4. **Dodati validaciju** - client-side validacija
5. **Testirati funkcionalnost** - proveriti da rade

## 🎯 Očekivani rezultat

Nakon implementacije:
- **Strukturiran UI** za conditions umesto raw JSON
- **Multiple select** komponente za kategorije i partnere
- **Dinamički atributi** sa opcijama iz baze
- **Number inputs** za količine i vrednosti
- **Real-time JSON generisanje** iz strukturiranih podataka