# Formula Builder Components Implementation Plan

## 🎯 Cilj
Kreirati strukturirane UI komponente za uređivanje formula umesto raw JSON unosa.

## 📋 Struktura komponenti

```
src/lib/components/pricing-rules/
├── builders/
│   └── FormulaBuilder.svelte
├── formula-types/
│   ├── ProportionalMarkupForm.svelte
│   ├── MarkupCostForm.svelte
│   ├── FixedPriceForm.svelte
│   ├── DiscountForm.svelte
│   ├── PercentageMarkupForm.svelte
│   └── CustomScriptForm.svelte
└── types.ts
```

## 🔧 Tipovi formula (iz UPUTSTVA)

### 1. ProportionalMarkupForm - **NAJVAŽNIJI**
```json
{
  "type": "proportional_markup",
  "lower_bound": 400,
  "lower_markup": 70,
  "upper_bound": 2000,
  "upper_markup": 20,
  "min_price": 599.99,
  "max_price": 5000
}
```

**UI polja:**
- `lower_bound` - Number input (Donja granica $)
- `lower_markup` - Number input (Donja marža %)
- `upper_bound` - Number input (Gornja granica $)
- `upper_markup` - Number input (Gornja marža %)
- `min_price` - Number input (Min. cena $ - opciono)
- `max_price` - Number input (Max. cena $ - opciono)

### 2. MarkupCostForm
```json
{
  "type": "markup_cost",
  "value": 1.5
}
```

**UI polja:**
- `value` - Number input (Multiplier, npr. 1.5 = 150%)

### 3. FixedPriceForm
```json
{
  "type": "fixed_price",
  "value": 99.99
}
```

**UI polja:**
- `value` - Number input (Fiksna cena $)

### 4. DiscountForm
```json
{
  "type": "discount",
  "discount_percent": 15
}
```

**UI polja:**
- `discount_percent` - Number input (Popust %)

### 5. PercentageMarkupForm
```json
{
  "type": "percentage_markup",
  "value": 25
}
```

**UI polja:**
- `value` - Number input (Procenat marže %)

### 6. CustomScriptForm
```json
{
  "type": "custom_script",
  "script": "return cost * 1.2 + variables.fixed_fee;",
  "variables": {
    "fixed_fee": 10,
    "min_margin": 0.15
  }
}
```

**UI polja:**
- `script` - Textarea (JavaScript kod)
- `variables` - Dinamički key-value inputs

## 🏗️ Implementacija komponenti

### FormulaBuilder.svelte - Glavna komponenta

```typescript
interface FormulaBuilderProps {
  formula: PricingFormula;
  onFormulaChange: (formula: PricingFormula) => void;
}
```

**Funkcionalnost:**
1. Select dropdown za tip formule
2. Dinamički prikaz odgovarajuće forme na osnovu tipa
3. Real-time ažuriranje JSON objekta
4. Validacija polja

### Tipovi komponenti

Svaka komponenta prima:
```typescript
interface FormulaTypeProps {
  formula: Partial<PricingFormula>;
  onFormulaChange: (updates: Partial<PricingFormula>) => void;
}
```

## 📊 Implementacijski detalji

### 1. FormulaBuilder.svelte

```svelte
<script lang="ts">
  import type { PricingFormula } from '$lib/types/pricing-rules.types';
  import * as Select from '$lib/components/ui/select';
  import * as Card from '$lib/components/ui/card';
  
  // Import formula type components
  import ProportionalMarkupForm from '../formula-types/ProportionalMarkupForm.svelte';
  import MarkupCostForm from '../formula-types/MarkupCostForm.svelte';
  // ... other imports
  
  interface Props {
    formula: PricingFormula;
    onFormulaChange: (formula: PricingFormula) => void;
  }
  
  let { formula, onFormulaChange }: Props = $props();
  
  const formulaTypes = [
    { value: 'proportional_markup', label: 'Proporcionalna marža' },
    { value: 'markup_cost', label: 'Fiksna marža' },
    { value: 'fixed_price', label: 'Fiksna cena' },
    { value: 'discount', label: 'Popust' },
    { value: 'percentage_markup', label: 'Procenat marže' },
    { value: 'custom_script', label: 'Prilagođeni script' }
  ];
  
  function handleTypeChange(newType: string) {
    // Reset formula with new type and default values
    const baseFormula = { type: newType };
    
    switch (newType) {
      case 'proportional_markup':
        onFormulaChange({ ...baseFormula, lower_bound: 0, lower_markup: 50, upper_bound: 1000, upper_markup: 20 });
        break;
      case 'markup_cost':
        onFormulaChange({ ...baseFormula, value: 1.2 });
        break;
      // ... other cases
    }
  }
  
  function handleFormulaUpdate(updates: Partial<PricingFormula>) {
    onFormulaChange({ ...formula, ...updates });
  }
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>Konfiguracija formule</Card.Title>
  </Card.Header>
  <Card.Content class="space-y-4">
    <!-- Formula Type Selector -->
    <div class="space-y-2">
      <Label>Tip formule</Label>
      <Select.Root
        type="single"
        value={formula.type}
        onValueChange={handleTypeChange}
      >
        <Select.Trigger>
          {formulaTypes.find(t => t.value === formula.type)?.label || 'Izaberite tip'}
        </Select.Trigger>
        <Select.Content>
          {#each formulaTypes as type}
            <Select.Item value={type.value}>{type.label}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
    </div>
    
    <!-- Dynamic Formula Form -->
    {#if formula.type === 'proportional_markup'}
      <ProportionalMarkupForm {formula} onFormulaChange={handleFormulaUpdate} />
    {:else if formula.type === 'markup_cost'}
      <MarkupCostForm {formula} onFormulaChange={handleFormulaUpdate} />
    {:else if formula.type === 'fixed_price'}
      <FixedPriceForm {formula} onFormulaChange={handleFormulaUpdate} />
    {:else if formula.type === 'discount'}
      <DiscountForm {formula} onFormulaChange={handleFormulaUpdate} />
    {:else if formula.type === 'percentage_markup'}
      <PercentageMarkupForm {formula} onFormulaChange={handleFormulaUpdate} />
    {:else if formula.type === 'custom_script'}
      <CustomScriptForm {formula} onFormulaChange={handleFormulaUpdate} />
    {/if}
  </Card.Content>
</Card.Root>
```

### 2. ProportionalMarkupForm.svelte - Najvažniji

```svelte
<script lang="ts">
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import type { PricingFormula } from '$lib/types/pricing-rules.types';
  
  interface Props {
    formula: Partial<PricingFormula>;
    onFormulaChange: (updates: Partial<PricingFormula>) => void;
  }
  
  let { formula, onFormulaChange }: Props = $props();
  
  function updateField(field: string, value: number | undefined) {
    onFormulaChange({ [field]: value });
  }
</script>

<div class="grid grid-cols-2 gap-4">
  <div class="space-y-2">
    <Label for="lower_bound">Donja granica ($)</Label>
    <Input
      id="lower_bound"
      type="number"
      step="0.01"
      value={formula.lower_bound || ''}
      onchange={(e) => updateField('lower_bound', parseFloat(e.currentTarget.value) || undefined)}
      placeholder="400"
    />
    <p class="text-xs text-muted-foreground">Nabavna cena ispod koje se primenjuje donja marža</p>
  </div>
  
  <div class="space-y-2">
    <Label for="lower_markup">Donja marža (%)</Label>
    <Input
      id="lower_markup"
      type="number"
      step="0.1"
      value={formula.lower_markup || ''}
      onchange={(e) => updateField('lower_markup', parseFloat(e.currentTarget.value) || undefined)}
      placeholder="70"
    />
    <p class="text-xs text-muted-foreground">Marža za proizvode ispod donje granice</p>
  </div>
  
  <div class="space-y-2">
    <Label for="upper_bound">Gornja granica ($)</Label>
    <Input
      id="upper_bound"
      type="number"
      step="0.01"
      value={formula.upper_bound || ''}
      onchange={(e) => updateField('upper_bound', parseFloat(e.currentTarget.value) || undefined)}
      placeholder="2000"
    />
    <p class="text-xs text-muted-foreground">Nabavna cena iznad koje se primenjuje gornja marža</p>
  </div>
  
  <div class="space-y-2">
    <Label for="upper_markup">Gornja marža (%)</Label>
    <Input
      id="upper_markup"
      type="number"
      step="0.1"
      value={formula.upper_markup || ''}
      onchange={(e) => updateField('upper_markup', parseFloat(e.currentTarget.value) || undefined)}
      placeholder="20"
    />
    <p class="text-xs text-muted-foreground">Marža za proizvode iznad gornje granice</p>
  </div>
  
  <div class="space-y-2">
    <Label for="min_price">Min. cena ($) - opciono</Label>
    <Input
      id="min_price"
      type="number"
      step="0.01"
      value={formula.min_price || ''}
      onchange={(e) => updateField('min_price', parseFloat(e.currentTarget.value) || undefined)}
      placeholder="599.99"
    />
    <p class="text-xs text-muted-foreground">Minimalna prodajna cena</p>
  </div>
  
  <div class="space-y-2">
    <Label for="max_price">Max. cena ($) - opciono</Label>
    <Input
      id="max_price"
      type="number"
      step="0.01"
      value={formula.max_price || ''}
      onchange={(e) => updateField('max_price', parseFloat(e.currentTarget.value) || undefined)}
      placeholder="5000"
    />
    <p class="text-xs text-muted-foreground">Maksimalna prodajna cena</p>
  </div>
</div>

<!-- Primer kalkulacije -->
<div class="mt-4 p-3 bg-muted rounded-lg">
  <h4 class="text-sm font-medium mb-2">Primer kalkulacije:</h4>
  <div class="text-xs text-muted-foreground space-y-1">
    {#if formula.lower_bound && formula.lower_markup}
      <p>• Nabavka ≤ ${formula.lower_bound} → {formula.lower_markup}% marža</p>
    {/if}
    {#if formula.upper_bound && formula.upper_markup}
      <p>• Nabavka ≥ ${formula.upper_bound} → {formula.upper_markup}% marža</p>
    {/if}
    {#if formula.lower_bound && formula.upper_bound}
      <p>• Nabavka ${formula.lower_bound}-${formula.upper_bound} → proporcionalno između marži</p>
    {/if}
  </div>
</div>
```

### 3. Ostale forme - jednostavnije

**MarkupCostForm.svelte:**
```svelte
<div class="space-y-2">
  <Label for="value">Multiplier</Label>
  <Input
    id="value"
    type="number"
    step="0.01"
    value={formula.value || ''}
    onchange={(e) => updateField('value', parseFloat(e.currentTarget.value) || undefined)}
    placeholder="1.5"
  />
  <p class="text-xs text-muted-foreground">Nabavna cena × {formula.value || '1.5'} = Prodajna cena</p>
</div>
```

## 🔄 Integracija sa glavnom formom

U [`+page.svelte`](src/routes/(app)/crm/pricing-rules/[id]/+page.svelte):

```svelte
<script>
  import FormulaBuilder from '$lib/components/pricing-rules/builders/FormulaBuilder.svelte';
  
  // Parse existing formula
  let parsedFormula = $derived(() => {
    try {
      return typeof $formData.formula === 'string' 
        ? JSON.parse($formData.formula) 
        : $formData.formula;
    } catch {
      return { type: 'markup_cost', value: 1.2 };
    }
  });
  
  function handleFormulaChange(newFormula) {
    $formData.formula = JSON.stringify(newFormula);
  }
</script>

<!-- Umesto postojećeg Textarea -->
<FormulaBuilder 
  formula={parsedFormula}
  onFormulaChange={handleFormulaChange}
/>
```

## ✅ Sledeći koraci

1. **Kreirati types.ts** - TypeScript definicije
2. **Implementirati FormulaBuilder.svelte** - glavna komponenta
3. **Kreirati sve formula-type komponente** - 6 komponenti
4. **Testirati komponente** - proveriti da rade
5. **Integrisati u glavnu formu** - zameniti Textarea
6. **Dodati validaciju** - client-side validacija

## 🎯 Očekivani rezultat

Nakon implementacije:
- **Strukturiran UI** umesto raw JSON
- **Type-safe** komponente sa validacijom
- **Real-time preview** generisanog JSON-a
- **Intuitivno korisničko iskustvo**
- **Održiv kod** sa modularnim komponentama