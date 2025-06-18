<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import type { PricingFormula } from '$lib/types/pricing-rules.types';

	interface Props {
		formula: Partial<PricingFormula>;
		onFormulaChange: (updates: Partial<PricingFormula>) => void;
	}

	let { formula, onFormulaChange }: Props = $props();

	let variables = $derived(formula.variables ? Object.entries(formula.variables) : []);

	function updateScript(script: string) {
		onFormulaChange({ script });
	}

	function updateVariableKey(index: number, oldKey: string, newKey: string) {
		if (!formula.variables || newKey === oldKey || !newKey.trim()) return;
		const newVariables = { ...formula.variables };
		if (newVariables[newKey] === undefined) {
			// Avoid overwriting if new key already exists (simple check)
			newVariables[newKey] = newVariables[oldKey];
			delete newVariables[oldKey];
			onFormulaChange({ variables: newVariables });
		} else {
			// Maybe show a toast error: "Variable key already exists"
			// For now, revert the input change or ignore
			// This part needs more robust handling in a real app
		}
	}

	function updateVariableValue(key: string, value: string) {
		const numValue = Number(value);
		if (!isNaN(numValue)) {
			onFormulaChange({
				variables: {
					...formula.variables,
					[key]: numValue
				}
			});
		}
	}

	function addVariable() {
		const newKey = `var${variables.length + 1}`;
		onFormulaChange({
			variables: {
				...formula.variables,
				[newKey]: 0
			}
		});
	}

	function removeVariable(key: string) {
		if (!formula.variables) return;
		const newVariables = { ...formula.variables };
		delete newVariables[key];
		onFormulaChange({ variables: newVariables });
	}
</script>

<div class="space-y-4">
	<div class="space-y-2">
		<Label for="custom_script_code">JavaScript kod za izračunavanje cene</Label>
		<Textarea
			id="custom_script_code"
			value={formula.script ?? ''}
			oninput={(e) => updateScript(e.currentTarget.value)}
			placeholder="return cost_price * 1.2 + variables.fixed_fee;"
			rows={6}
			class="font-mono text-sm"
		/>
		<p class="text-xs text-muted-foreground">
			Dostupne varijable u skripti: `cost_price`, `base_price`, `retail_price`, `quantity`,
			`partner_id`, `product_id`, `category_ids`, `attributes` (kao objekat), i `variables`
			(definisane ispod). Skripta mora da vrati numeričku vrednost.
		</p>
	</div>

	<div class="space-y-2">
		<div class="flex items-center justify-between">
			<Label>Prilagođene varijable (opciono)</Label>
			<Button variant="outline" size="sm" onclick={addVariable}>Dodaj varijablu</Button>
		</div>
		{#if variables.length === 0}
			<p class="text-xs text-muted-foreground italic">Nema definisanih varijabli.</p>
		{/if}
		<div class="space-y-3">
			{#each variables as [key, value], index (key)}
				<div class="flex items-center gap-2">
					<Input
						type="text"
						value={key}
						onblur={(e) => updateVariableKey(index, key, e.currentTarget.value)}
						placeholder="Ime varijable"
						class="font-mono text-sm"
					/>
					<Input
						type="number"
						value={String(value)}
						oninput={(e) => updateVariableValue(key, e.currentTarget.value)}
						placeholder="Vrednost"
						class="font-mono text-sm"
					/>
					<Button
						variant="ghost"
						size="icon"
						onclick={() => removeVariable(key)}
						title="Obriši varijablu"
					>
						<Trash2 class="h-4 w-4" />
					</Button>
				</div>
			{/each}
		</div>
		<p class="text-xs text-muted-foreground">
			Ove varijable će biti dostupne unutar skripte preko `variables.imeVarijable`.
		</p>
	</div>
</div>
