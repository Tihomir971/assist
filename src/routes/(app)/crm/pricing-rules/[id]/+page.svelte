<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	// UI Components
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import * as Select from '$lib/components/ui/select/index.js';

	// Icons
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Save from '@lucide/svelte/icons/save';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	import type { PageData } from './$types';
	import { pricingRulesInsertSchema } from '$lib/types/supabase.zod.schemas';
	import type { PricingFormula, PricingConditions } from '$lib/types/pricing-rules.types';
	import FormulaBuilder from '$lib/components/pricing-rules/builders/FormulaBuilder.svelte';
	import ConditionsBuilder from '$lib/components/pricing-rules/builders/ConditionsBuilder.svelte';

	let { data }: { data: PageData } = $props();

	// Form setup
	const form = superForm(data.formPricingRule, {
		validators: zodClient(pricingRulesInsertSchema),
		onResult: ({ result }) => {
			if (result.type === 'success') {
				toast.success(
					data.isCreateMode ? 'Pravilo je uspešno kreirano' : 'Pravilo je uspešno ažurirano'
				);
				if (data.isCreateMode && result.data?.data?.id) {
					goto(`/crm/pricing-rules/${result.data.data.id}`);
				}
			} else if (result.type === 'failure') {
				toast.error('Greška pri čuvanju pravila');
			}
		}
	});

	const { form: formData, enhance: formEnhance } = form;

	// Helper functions
	function goBack() {
		goto('/crm/pricing-rules');
	}

	function handleDeleteSubmit(event: Event) {
		if (!confirm(`Da li ste sigurni da želite da obrišete pravilo "${data.rule?.name}"?`)) {
			event.preventDefault();
		} else {
			toast.success('Pravilo je obrisano');
			setTimeout(() => goto('/crm/pricing-rules'), 1000);
		}
	}

	// Reactive state for parsed formula
	let parsedFormula = $derived(() => {
		try {
			let formulaObj: any;
			if (typeof $formData.formula === 'string' && $formData.formula.trim() !== '') {
				formulaObj = JSON.parse($formData.formula);
			} else if (
				typeof $formData.formula === 'object' &&
				$formData.formula !== null &&
				!Array.isArray($formData.formula)
			) {
				formulaObj = $formData.formula;
			}

			if (formulaObj && typeof formulaObj === 'object' && 'type' in formulaObj) {
				return formulaObj as PricingFormula;
			}
			// Default formula if parsing fails or it's empty/invalid/not an object with 'type'
			return { type: 'markup_cost', value: 1.2 } as PricingFormula;
		} catch (e) {
			console.warn('Failed to parse formula JSON, using default:', $formData.formula, e);
			return { type: 'markup_cost', value: 1.2 } as PricingFormula;
		}
	});

	function handleFormulaChange(newFormula: PricingFormula) {
		$formData.formula = JSON.stringify(newFormula);
	}

	// Reactive state for parsed conditions
	let parsedConditions = $derived(() => {
		try {
			let conditionsObj: any;
			if (typeof $formData.conditions === 'string' && $formData.conditions.trim() !== '') {
				conditionsObj = JSON.parse($formData.conditions);
			} else if (
				typeof $formData.conditions === 'object' &&
				$formData.conditions !== null
				// No need to check for Array.isArray here, as PricingConditions is an object
			) {
				conditionsObj = $formData.conditions;
			}

			if (conditionsObj && typeof conditionsObj === 'object' && !Array.isArray(conditionsObj)) {
				return conditionsObj as PricingConditions;
			}
			return {} as PricingConditions; // Default to empty object
		} catch (e) {
			console.warn('Failed to parse conditions JSON, using default:', $formData.conditions, e);
			return {} as PricingConditions;
		}
	});

	function handleConditionsChange(newConditions: PricingConditions) {
		$formData.conditions = JSON.stringify(newConditions);
	}
</script>

<div class="flex-1 overflow-y-auto">
	<div class="container mx-auto max-w-4xl py-6">
		<!-- Header -->
		<div class="mb-6 flex items-center justify-between">
			<div class="flex items-center gap-4">
				<Button variant="ghost" size="sm" onclick={goBack} class="gap-2">
					<ArrowLeft class="h-4 w-4" />
					Nazad
				</Button>
				<div>
					<h1 class="text-3xl font-bold tracking-tight">
						{data.isCreateMode ? 'Novo cenovne pravilo' : `Edituj: ${data.rule?.name}`}
					</h1>
					<p class="text-muted-foreground">
						{data.isCreateMode
							? 'Kreiraj novo pravilo za automatsko računanje cena'
							: 'Izmeni postojeće pravilo'}
					</p>
				</div>
			</div>
			<div class="flex gap-2">
				{#if !data.isCreateMode}
					<form method="POST" action="?/delete" use:enhance onsubmit={handleDeleteSubmit}>
						<input type="hidden" name="id" value={data.rule?.id} />
						<Button type="submit" variant="destructive" size="sm" class="gap-2">
							<Trash2 class="h-4 w-4" />
							Obriši
						</Button>
					</form>
				{/if}
			</div>
		</div>

		<!-- Main Form -->
		<form method="POST" action="?/upsert" use:formEnhance class="space-y-6">
			{#if !data.isCreateMode}
				<input type="hidden" name="id" bind:value={$formData.id} />
			{/if}

			<!-- Basic Information -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Osnovne informacije</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<Label for="name">Ime pravila *</Label>
							<Input
								id="name"
								name="name"
								bind:value={$formData.name}
								placeholder="Unesite ime pravila..."
								required
							/>
						</div>
						<div class="space-y-2">
							<Label for="priority">Prioritet</Label>
							<Input
								id="priority"
								name="priority"
								type="number"
								bind:value={$formData.priority}
								placeholder="0"
							/>
						</div>
					</div>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<Label for="target_group">Ciljna grupa</Label>
							<Input
								id="target_group"
								name="target_group"
								bind:value={$formData.target_group}
								placeholder="npr. retail, wholesale..."
							/>
						</div>
						<div class="flex items-center space-x-2">
							<Switch id="is_active" name="is_active" bind:checked={$formData.is_active} />
							<Label for="is_active">Aktivno pravilo</Label>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Formula Configuration -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Konfiguracija formule</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">
					<FormulaBuilder formula={parsedFormula()} onFormulaChange={handleFormulaChange} />
					<!-- Hidden input to ensure $formData.formula is submitted with the form -->
					<input type="hidden" name="formula" value={$formData.formula} />
				</Card.Content>
			</Card.Root>

			<!-- Conditions -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Uslovi primene</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">
					{#if data.lookupData && data.supabase}
						<ConditionsBuilder
							conditions={parsedConditions()}
							lookupData={data.lookupData}
							onConditionsChange={handleConditionsChange}
							supabase={data.supabase}
						/>
						<!-- Hidden input to ensure $formData.conditions is submitted with the form -->
						<input type="hidden" name="conditions" value={$formData.conditions} />
					{:else}
						<p class="text-sm text-destructive">
							Greška: Lookup podaci ili Supabase klijent nisu dostupni.
						</p>
					{/if}
				</Card.Content>
			</Card.Root>

			<!-- Date Range -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Vremenski period</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<Label for="starts_at">Važi od</Label>
							<Input
								id="starts_at"
								name="starts_at"
								type="datetime-local"
								bind:value={$formData.starts_at}
							/>
						</div>
						<div class="space-y-2">
							<Label for="ends_at">Važi do</Label>
							<Input
								id="ends_at"
								name="ends_at"
								type="datetime-local"
								bind:value={$formData.ends_at}
							/>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Actions -->
			<div class="flex justify-end gap-2">
				<Button type="button" variant="outline" onclick={goBack}>Otkaži</Button>
				<Button type="submit" class="gap-2">
					<Save class="h-4 w-4" />
					{data.isCreateMode ? 'Kreiraj pravilo' : 'Sačuvaj izmene'}
				</Button>
			</div>
		</form>
	</div>
</div>
