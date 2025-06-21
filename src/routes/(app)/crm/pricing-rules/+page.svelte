<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { z } from 'zod';

	// UI Components
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	// Icons
	import Plus from '@lucide/svelte/icons/plus';
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Copy from '@lucide/svelte/icons/copy';
	import ArrowUpCircle from '@lucide/svelte/icons/arrow-up-circle';
	import ArrowDownCircle from '@lucide/svelte/icons/arrow-down-circle';
	import type { ActionResult } from '@sveltejs/kit'; // Import ActionResult

	import type { PageData } from './$types';
	import { pricingRulesColumns } from './columns';

	let { data }: { data: PageData } = $props();

	// Create form schema
	const createSchema = z.object({
		name: z.string().min(1, 'Ime je obavezno')
	});

	// Dialog state
	let createDialogOpen = $state(false);

	// Create form
	const createForm = superForm(
		{ name: '' },
		{
			validators: zodClient(createSchema),
			onResult: ({ result }) => {
				if (result.type === 'success' && result.data?.ruleId) {
					createDialogOpen = false;
					toast.success('Pravilo je uspešno kreirano');
					goto(`/crm/pricing-rules/${result.data.ruleId}`);
				} else if (result.type === 'failure') {
					// Assuming 'failure' from superForm means a validation error or server fail() with data
					const formError =
						result.data &&
						typeof result.data === 'object' &&
						'form' in result.data &&
						(result.data.form as { message?: string })?.message
							? (result.data.form as { message: string }).message
							: 'Greška pri kreiranju pravila.';
					toast.error(formError);
				}
			},
			onError: ({ result }) => {
				// This catches errors like SvelteKit error() or unexpected server issues
				toast.error(result.error.message || 'Nepoznata greška prilikom kreiranja.');
			}
		}
	);

	const { form: createFormData, enhance: createEnhance } = createForm;

	// SubmitFunction for swap priorities form enhance
	const handleSubmitSwapPriorities: import('@sveltejs/kit').SubmitFunction = async ({
		action,
		formData,
		formElement,
		controller,
		submitter,
		cancel
	}) => {
		// Optional: Show loading state or disable buttons before fetch
		// e.g., submitter?.setAttribute('disabled', 'true');

		return async ({ result, update }) => {
			// Optional: Re-enable buttons or hide loading state
			// e.g., submitter?.removeAttribute('disabled');

			if (result.type === 'success') {
				toast.success('Prioritet je uspešno promenjen.');
			} else if (result.type === 'failure') {
				const errorMessage =
					result.data && typeof result.data === 'object' && 'error' in result.data
						? (result.data as { error: string }).error
						: 'Greška pri promeni prioriteta.';
				toast.error(errorMessage);
			} else if (result.type === 'error') {
				// This catches SvelteKit error() or unexpected server issues
				toast.error(result.error.message || 'Nepoznata greška prilikom promene prioriteta.');
			}
			// Call update to refresh data from the load function
			// This is crucial for the UI to reflect the new order.
			await update({ reset: false });
		};
	};

	function handleEdit(id: number) {
		goto(`/crm/pricing-rules/${id}`);
	}

	function handleCreate() {
		createDialogOpen = true;
	}

	function handleClone(rule: any) {
		// TODO: Implement clone functionality
		toast.info('Clone funkcionalnost će biti dodana uskoro');
	}

	function formatDate(dateString: string | null) {
		if (!dateString) return '-';
		return new Date(dateString).toLocaleDateString('sr-RS');
	}

	function formatFormula(formula: any) {
		if (!formula || typeof formula !== 'object') return 'N/A';
		return formula.type || 'Unknown';
	}

	function handleDeleteSubmit(event: Event) {
		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);
		const ruleName = formData.get('ruleName') as string;

		if (!confirm(`Da li ste sigurni da želite da obrišete pravilo "${ruleName}"?`)) {
			event.preventDefault();
		}
	}
</script>

<div class="container mx-auto py-6">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Cenovne formule</h1>
			<p class="text-muted-foreground">Upravljanje pravilima za automatsko računanje cena</p>
		</div>
		<Button onclick={handleCreate} class="gap-2">
			<Plus class="h-4 w-4" />
			Novo pravilo
		</Button>
	</div>

	<Card.Root>
		<Card.Header>
			<Card.Title>Sva pravila ({data.rules.length})</Card.Title>
		</Card.Header>
		<Card.Content>
			{#if data.rules.length === 0}
				<div class="py-8 text-center">
					<p class="mb-4 text-muted-foreground">Nema definisanih pravila</p>
					<Button onclick={handleCreate} variant="outline" class="gap-2">
						<Plus class="h-4 w-4" />
						Kreiraj prvo pravilo
					</Button>
				</div>
			{:else}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							{#each pricingRulesColumns as column}
								<Table.Head class={column.className || ''}>{column.label}</Table.Head>
							{/each}
							<Table.Head class="w-28 text-center">Promena Prioriteta</Table.Head>
							<Table.Head class="w-24 text-right">Akcije</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.rules as rule, index (rule.id)}
							<Table.Row>
								{#each pricingRulesColumns as column}
									<Table.Cell class={column.className || ''}>
										{#if column.type === 'boolean'}
											<Badge variant={(rule as any)[column.key] ? 'default' : 'secondary'}>
												{(rule as any)[column.key] ? 'Aktivno' : 'Neaktivno'}
											</Badge>
										{:else if column.type === 'date'}
											{formatDate((rule as any)[column.key])}
										{:else if column.key === 'name'}
											<button onclick={() => handleEdit(rule.id)} class="text-left hover:underline">
												{rule.name}
											</button>
										{:else if ['partnerCount', 'categoryCount', 'brandCount', 'attributeCount'].includes(column.key)}
											<Badge variant={(rule as any)[column.key] > 0 ? 'default' : 'secondary'}>
												{(rule as any)[column.key]}
											</Badge>
										{:else if column.key === 'priority'}
											<Badge variant="secondary">{rule.priority}</Badge>
										{:else}
											{(rule as any)[column.key] || '-'}
										{/if}
									</Table.Cell>
								{/each}

								<Table.Cell class="text-center">
									<div class="flex items-center justify-center space-x-1">
										{#if index > 0 && data.rules[index - 1]}
											<form
												method="POST"
												action="?/swapPriorities"
												use:enhance={handleSubmitSwapPriorities}
											>
												<input type="hidden" name="rule1Id" value={data.rules[index - 1].id} />
												<input type="hidden" name="rule2Id" value={rule.id} />
												<Button type="submit" variant="ghost" size="icon" title="Pomeri gore">
													<ArrowUpCircle class="h-4 w-4" />
												</Button>
											</form>
										{:else}
											<div class="h-9 w-9"></div>
										{/if}
										{#if index < data.rules.length - 1 && data.rules[index + 1]}
											<form
												method="POST"
												action="?/swapPriorities"
												use:enhance={handleSubmitSwapPriorities}
											>
												<input type="hidden" name="rule1Id" value={rule.id} />
												<input type="hidden" name="rule2Id" value={data.rules[index + 1].id} />
												<Button type="submit" variant="ghost" size="icon" title="Pomeri dole">
													<ArrowDownCircle class="h-4 w-4" />
												</Button>
											</form>
										{:else}
											<div class="h-9 w-9"></div>
										{/if}
									</div>
								</Table.Cell>

								<Table.Cell class="text-right">
									<DropdownMenu.Root>
										<DropdownMenu.Trigger>
											{#snippet child({ props })}
												<Button {...props} variant="ghost" class="h-8 w-8 p-0">
													<Ellipsis />
												</Button>
											{/snippet}
										</DropdownMenu.Trigger>
										<DropdownMenu.Content align="end">
											<DropdownMenu.Item onclick={() => handleEdit(rule.id)} class="gap-2">
												<Pencil class="h-4 w-4" />
												Edituj
											</DropdownMenu.Item>
											<DropdownMenu.Item onclick={() => handleClone(rule)} class="gap-2">
												<Copy class="h-4 w-4" />
												Kloniraj
											</DropdownMenu.Item>
											<DropdownMenu.Item class="gap-2 p-0 text-destructive focus:text-destructive">
												<form
													method="POST"
													action="?/delete"
													use:enhance
													onsubmit={handleDeleteSubmit}
													class="w-full"
												>
													<input type="hidden" name="id" value={rule.id} />
													<input type="hidden" name="ruleName" value={rule.name} />
													<button
														type="submit"
														class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left hover:bg-accent"
													>
														<Trash2 class="h-4 w-4" />
														Obriši
													</button>
												</form>
											</DropdownMenu.Item>
										</DropdownMenu.Content>
									</DropdownMenu.Root>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			{/if}
		</Card.Content>
	</Card.Root>
</div>

<!-- Create Dialog -->
<Dialog.Root bind:open={createDialogOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Novo cenovne pravilo</Dialog.Title>
			<Dialog.Description>
				Unesite ime novog pravila. Moći ćete da konfigurišete ostale opcije nakon kreiranja.
			</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/create" use:createEnhance>
			<div class="grid gap-4 py-4">
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="name" class="text-right">Ime</Label>
					<Input
						id="name"
						name="name"
						bind:value={$createFormData.name}
						placeholder="Unesite ime pravila..."
						class="col-span-3"
						required
					/>
				</div>
			</div>
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (createDialogOpen = false)}>
					Otkaži
				</Button>
				<Button type="submit">Kreiraj pravilo</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
