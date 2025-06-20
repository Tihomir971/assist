# Pricing Rules Test Page Implementation Plan

## 🎯 Goal
Create a simple test page where users can input a product ID and base price to test pricing rules and get calculated results.

## 📍 Location
`src/routes/(app)/lab/pricing-test/`

## 🏗️ Architecture

### File Structure
```
src/routes/(app)/lab/pricing-test/
├── +page.server.ts     # Server logic for testing pricing rules
├── +page.svelte        # Test form and results display
└── schema.ts           # Zod schemas for form validation
```

## 📋 Implementation Details

### 1. Schema Definition (`schema.ts`)

```typescript
import { z } from 'zod';

export const pricingTestSchema = z.object({
  product_id: z.number().min(1, 'Product ID is required'),
  base_price: z.number().min(0.01, 'Base price must be greater than 0'),
  cost_price: z.number().min(0.01, 'Cost price must be greater than 0'),
  retail_price: z.number().optional(),
  partner_id: z.number().optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1').default(1),
  order_value: z.number().optional(),
  target_group: z.string().optional()
});

export type PricingTestInput = z.infer<typeof pricingTestSchema>;
```

### 2. Server Logic (`+page.server.ts`)

```typescript
import type { PageServerLoad, Actions } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { fail } from '@sveltejs/kit';
import { PricingRulesService } from '$lib/services/supabase/pricing-rules.service';
import { pricingTestSchema } from './schema';
import type { PricingContext } from '$lib/types/pricing-rules.types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  // Initialize form with default values
  const form = await superValidate(zod(pricingTestSchema));
  
  // Load active pricing rules for display
  const pricingService = new PricingRulesService(supabase);
  const activeRules = await pricingService.list({ is_active: true });

  return {
    form,
    activeRules
  };
};

export const actions: Actions = {
  test: async ({ request, locals: { supabase } }) => {
    const form = await superValidate(request, zod(pricingTestSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      const pricingService = new PricingRulesService(supabase);
      
      // Create pricing context from form data
      const context: PricingContext = {
        product_id: form.data.product_id,
        partner_id: form.data.partner_id,
        quantity: form.data.quantity,
        order_value: form.data.order_value,
        target_group: form.data.target_group,
        base_price: form.data.base_price,
        cost_price: form.data.cost_price,
        retail_price: form.data.retail_price
      };

      // Find applicable rules
      const applicableRules = await pricingService.findApplicableRules(context);
      
      // Calculate final price
      const calculatedPrice = await pricingService.calculatePrice(context);

      // Test each rule individually for detailed results
      const ruleTests = await Promise.all(
        applicableRules.map(async (rule) => {
          const testResult = await pricingService.testRule(rule.id, context);
          return {
            rule,
            ...testResult
          };
        })
      );

      return {
        form,
        success: true,
        results: {
          context,
          applicableRules,
          calculatedPrice,
          ruleTests,
          fallbackPrice: context.base_price
        }
      };
    } catch (error) {
      console.error('Pricing test error:', error);
      return fail(500, {
        form,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
};
```

### 3. Frontend Component (`+page.svelte`)

```svelte
<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import { zod } from 'sveltekit-superforms/adapters';
  import { toast } from 'svelte-sonner';
  
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import * as Card from '$lib/components/ui/card';
  import * as Table from '$lib/components/ui/table';
  import { Badge } from '$lib/components/ui/badge';
  import { Separator } from '$lib/components/ui/separator';
  
  import { pricingTestSchema } from './schema';
  import type { PageData, ActionData } from './$types';

  let { data }: { data: PageData } = $props();
  
  const form = superForm(data.form, {
    validators: zod(pricingTestSchema),
    onResult: ({ result }) => {
      if (result.type === 'success') {
        toast.success('Pricing test completed successfully');
      } else if (result.type === 'failure') {
        toast.error('Pricing test failed');
      }
    }
  });

  const { form: formData, enhance } = form;
  
  // Get results from action data
  let results = $state<ActionData['results']>();
  $effect(() => {
    if (data.results) {
      results = data.results;
    }
  });
</script>

<div class="container mx-auto py-6 space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-3xl font-bold">Pricing Rules Test</h1>
    <Badge variant="secondary">Lab Tool</Badge>
  </div>

  <div class="grid gap-6 lg:grid-cols-2">
    <!-- Test Form -->
    <Card.Root>
      <Card.Header>
        <Card.Title>Test Parameters</Card.Title>
        <Card.Description>
          Enter product details to test pricing rules
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <form method="POST" action="?/test" use:enhance class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="product_id">Product ID *</Label>
              <Input
                id="product_id"
                type="number"
                bind:value={$formData.product_id}
                placeholder="Enter product ID"
                required
              />
            </div>
            
            <div class="space-y-2">
              <Label for="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                bind:value={$formData.quantity}
                placeholder="1"
                min="1"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="base_price">Base Price *</Label>
              <Input
                id="base_price"
                type="number"
                step="0.01"
                bind:value={$formData.base_price}
                placeholder="0.00"
                required
              />
            </div>
            
            <div class="space-y-2">
              <Label for="cost_price">Cost Price *</Label>
              <Input
                id="cost_price"
                type="number"
                step="0.01"
                bind:value={$formData.cost_price}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="retail_price">Retail Price</Label>
              <Input
                id="retail_price"
                type="number"
                step="0.01"
                bind:value={$formData.retail_price}
                placeholder="Optional"
              />
            </div>
            
            <div class="space-y-2">
              <Label for="partner_id">Partner ID</Label>
              <Input
                id="partner_id"
                type="number"
                bind:value={$formData.partner_id}
                placeholder="Optional"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="order_value">Order Value</Label>
              <Input
                id="order_value"
                type="number"
                step="0.01"
                bind:value={$formData.order_value}
                placeholder="Optional"
              />
            </div>
            
            <div class="space-y-2">
              <Label for="target_group">Target Group</Label>
              <Input
                id="target_group"
                bind:value={$formData.target_group}
                placeholder="Optional"
              />
            </div>
          </div>

          <Button type="submit" class="w-full">
            Test Pricing Rules
          </Button>
        </form>
      </Card.Content>
    </Card.Root>

    <!-- Active Rules Display -->
    <Card.Root>
      <Card.Header>
        <Card.Title>Active Pricing Rules</Card.Title>
        <Card.Description>
          Currently active rules ({data.activeRules.length})
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <div class="space-y-2 max-h-96 overflow-y-auto">
          {#each data.activeRules as rule}
            <div class="flex items-center justify-between p-2 border rounded">
              <div>
                <div class="font-medium">{rule.name}</div>
                <div class="text-sm text-muted-foreground">
                  Priority: {rule.priority} | Formula: {rule.formula.type}
                </div>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>
          {/each}
        </div>
      </Card.Content>
    </Card.Root>
  </div>

  <!-- Results Section -->
  {#if results}
    <Card.Root>
      <Card.Header>
        <Card.Title>Test Results</Card.Title>
      </Card.Header>
      <Card.Content class="space-y-6">
        <!-- Summary -->
        <div class="grid grid-cols-3 gap-4 text-center">
          <div class="space-y-2">
            <div class="text-2xl font-bold text-green-600">
              ${results.calculatedPrice.toFixed(2)}
            </div>
            <div class="text-sm text-muted-foreground">Final Price</div>
          </div>
          <div class="space-y-2">
            <div class="text-2xl font-bold">
              {results.applicableRules.length}
            </div>
            <div class="text-sm text-muted-foreground">Applicable Rules</div>
          </div>
          <div class="space-y-2">
            <div class="text-2xl font-bold text-blue-600">
              ${results.fallbackPrice?.toFixed(2) || '0.00'}
            </div>
            <div class="text-sm text-muted-foreground">Fallback Price</div>
          </div>
        </div>

        <Separator />

        <!-- Applicable Rules Details -->
        {#if results.applicableRules.length > 0}
          <div>
            <h3 class="text-lg font-semibold mb-4">Applicable Rules</h3>
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Rule Name</Table.Head>
                  <Table.Head>Priority</Table.Head>
                  <Table.Head>Formula Type</Table.Head>
                  <Table.Head>Calculated Price</Table.Head>
                  <Table.Head>Status</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {#each results.ruleTests as test}
                  <Table.Row>
                    <Table.Cell class="font-medium">{test.rule.name}</Table.Cell>
                    <Table.Cell>{test.rule.priority}</Table.Cell>
                    <Table.Cell>
                      <Badge variant="outline">{test.rule.formula.type}</Badge>
                    </Table.Cell>
                    <Table.Cell>
                      {#if test.price !== undefined}
                        <span class="font-mono">${test.price.toFixed(2)}</span>
                      {:else}
                        <span class="text-muted-foreground">N/A</span>
                      {/if}
                    </Table.Cell>
                    <Table.Cell>
                      {#if test.matches}
                        <Badge variant="default">Applied</Badge>
                      {:else}
                        <Badge variant="secondary">Not Applied</Badge>
                      {/if}
                    </Table.Cell>
                  </Table.Row>
                {/each}
              </Table.Body>
            </Table.Root>
          </div>
        {:else}
          <div class="text-center py-8 text-muted-foreground">
            <p>No applicable pricing rules found for the given parameters.</p>
            <p class="text-sm mt-2">The fallback price will be used.</p>
          </div>
        {/if}

        <!-- Context Details -->
        <div>
          <h3 class="text-lg font-semibold mb-4">Test Context</h3>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Product ID:</strong> {results.context.product_id}</div>
            <div><strong>Quantity:</strong> {results.context.quantity}</div>
            <div><strong>Base Price:</strong> ${results.context.base_price?.toFixed(2) || '0.00'}</div>
            <div><strong>Cost Price:</strong> ${results.context.cost_price?.toFixed(2) || '0.00'}</div>
            {#if results.context.retail_price}
              <div><strong>Retail Price:</strong> ${results.context.retail_price.toFixed(2)}</div>
            {/if}
            {#if results.context.partner_id}
              <div><strong>Partner ID:</strong> {results.context.partner_id}</div>
            {/if}
            {#if results.context.order_value}
              <div><strong>Order Value:</strong> ${results.context.order_value.toFixed(2)}</div>
            {/if}
            {#if results.context.target_group}
              <div><strong>Target Group:</strong> {results.context.target_group}</div>
            {/if}
          </div>
        </div>
      </Card.Content>
    </Card.Root>
  {/if}
</div>
```

## 🚀 Usage Instructions

### 1. Basic Test
1. Enter a **Product ID** (any number)
2. Enter **Base Price** and **Cost Price**
3. Click "Test Pricing Rules"
4. View the calculated result and which rules were applied

### 2. Advanced Test
- Add **Partner ID** to test partner-specific rules
- Set **Quantity** to test quantity-based conditions
- Add **Order Value** for order value conditions
- Set **Target Group** for group-specific rules

### 3. Results Interpretation
- **Final Price**: The calculated price after applying the highest priority applicable rule
- **Applicable Rules**: Number of rules that match the given conditions
- **Fallback Price**: The base price used if no rules apply

## 🔧 Features

### Input Validation
- Required fields: Product ID, Base Price, Cost Price
- Numeric validation with appropriate constraints
- Optional fields for advanced testing

### Real-time Testing
- Tests against actual database rules
- Shows which rules match and which don't
- Displays calculated prices for each applicable rule

### Detailed Results
- Summary of final calculated price
- List of all applicable rules with their details
- Context information showing what was tested
- Clear indication of which rule was actually applied

### Error Handling
- Graceful handling of calculation errors
- Clear error messages for invalid inputs
- Fallback to base price when rules fail

## 🎯 Benefits

1. **Quick Testing**: Easily test pricing rules without complex setup
2. **Rule Debugging**: See exactly which rules apply and why
3. **Price Validation**: Verify that pricing logic works as expected
4. **Development Tool**: Useful during pricing rule development and testing

## 📝 Next Steps

1. Create the files in the specified location
2. Test with existing pricing rules
3. Add more advanced features like:
   - Bulk testing with CSV import
   - Historical price comparison
   - Rule performance metrics
   - Export test results