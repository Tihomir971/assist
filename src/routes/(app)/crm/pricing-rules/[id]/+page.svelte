<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import {
		CalendarDate,
		DateFormatter,
		type DateValue,
		getLocalTimeZone,
		parseDate
	} from '@internationalized/date';

	// UI Components
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';

	// Icons
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import Save from '@lucide/svelte/icons/save';
	import Trash2 from '@lucide/svelte/icons/trash-2';

	import type { PageData } from './$types';
	import type { PricingFormula, PricingConditions } from '$lib/types/pricing-rules.types';
	import FormulaBuilder from '$lib/components/pricing-rules/builders/FormulaBuilder.svelte';
	import ConditionsBuilder from '$lib/components/pricing-rules/builders/ConditionsBuilder.svelte';

	let { data }: { data: PageData } = $props();

	// Form setup
	const form = superForm(data.formPricingRule, {
		dataType: 'json',
		onResult: ({ result }) => {
			if (result.type === 'success') {
				toast.success(
					data.isCreateMode ? 'Pravilo je uspešno kreirano' : 'Pravilo je uspešno ažurirano'
				);
				if (data.isCreateMode && result.data?.data?.id) {
					goto(`/crm/pricing-rules/${result.data.data.id}`);
				}
			} else if (result.type === 'failure') {
				const errorMessage = result.data?.error || 'Greška pri čuvanju pravila';
				toast.error(errorMessage);
			}
		}
	});

	const { form: formData, enhance: formEnhance } = form;

	const df = new DateFormatter('sr-Latn', {
		dateStyle: 'long'
	});

	let startsAtValue = $derived($formData.starts_at ? parseDate($formData.starts_at) : undefined);
	let endsAtValue = $derived($formData.ends_at ? parseDate($formData.ends_at) : undefined);

	// Handlers for child components
	function handleFormulaChange(newFormula: PricingFormula) {
		$formData.formula = newFormula;
	}

	function handleConditionsChange(newConditions: PricingConditions) {
		$formData.conditions = newConditions;
	}

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

			<FormulaBuilder
				formula={$formData.formula || { type: 'percentage_markup', value: 20 }}
				onFormulaChange={handleFormulaChange}
			/>

			<!-- Conditions -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Uslovi primene</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">
					{#if data.lookupData && data.supabase}
						<ConditionsBuilder
							conditions={$formData.conditions || {}}
							lookupData={data.lookupData}
							onConditionsChange={handleConditionsChange}
							supabase={data.supabase}
						/>
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
							<Popover.Root>
								<Popover.Trigger
									class="flex h-10 w-full items-center justify-start rounded-md border border-input bg-transparent px-3 py-2 text-left text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
								>
									{startsAtValue
										? df.format(startsAtValue.toDate(getLocalTimeZone()))
										: 'Početni datum'}
									<CalendarIcon class="ml-auto size-4 opacity-50" />
								</Popover.Trigger>
								<Popover.Content class="w-auto p-0">
									<Calendar
										type="single"
										locale="sr-Latn"
										value={startsAtValue}
										onValueChange={(v) => {
											$formData.starts_at = v ? v.toString() : null;
										}}
									/>
								</Popover.Content>
							</Popover.Root>
							<input type="hidden" name="starts_at" value={$formData.starts_at ?? ''} />
						</div>
						<div class="space-y-2">
							<Label for="ends_at">Važi do</Label>
							<Popover.Root>
								<Popover.Trigger
									class="flex h-10 w-full items-center justify-start rounded-md border border-input bg-transparent px-3 py-2 text-left text-sm ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
								>
									{endsAtValue
										? df.format(endsAtValue.toDate(getLocalTimeZone()))
										: 'Krajnji datum'}
									<CalendarIcon class="ml-auto size-4 opacity-50" />
								</Popover.Trigger>
								<Popover.Content class="w-auto p-0">
									<Calendar
										type="single"
										locale="sr-Latn"
										value={endsAtValue}
										onValueChange={(v) => {
											$formData.ends_at = v ? v.toString() : null;
										}}
									/>
								</Popover.Content>
							</Popover.Root>
							<input type="hidden" name="ends_at" value={$formData.ends_at ?? ''} />
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
