<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import * as z from 'zod/v4';
	import { toastManager } from '$lib/utils/toast-manager';

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
	import { DateHelper } from '$lib/scripts/intl';

	let { data }: { data: PageData } = $props();

	// Create form schema
	const createSchema = z.object({
		name: z.string().min(1, 'Ime je obavezno')
	});

	// Dialog state
	let createDialogOpen = $state(false);
	const dateHelper = new DateHelper();
	// Create form
	const createForm = superForm(
		{ name: '' },
		{
			validators: zod4Client(createSchema),
			onResult: ({ result }) => {
				if (result.type === 'success' && result.data?.ruleId) {
					createDialogOpen = false;
					toastManager.showSuccess('Pravilo je uspešno kreirano', {
						dedupeKey: 'pricing-rule-create-success'
					});
					goto(`/crm/pricing-rules/${result.data.ruleId}`);
				} else if (result.type === 'failure') {
					const errorMessage = result.data?.error || 'Greška pri kreiranju pravila.';
					toastManager.showError(errorMessage, {
						dedupeKey: `pricing-rule-create-error-${errorMessage.slice(0, 20)}`
					});
				}
			},
			onError: ({ result }) => {
				toastManager.showError(result.error.message || 'Nepoznata greška prilikom kreiranja.', {
					dedupeKey: 'pricing-rule-unexpected-error'
				});
			}
		}
	);

	const { form: createFormData, enhance: createEnhance } = createForm;

	// SubmitFunction for swap priorities form enhance
	const handleSubmitSwapPriorities: import('@sveltejs/kit').SubmitFunction = async () => {
		// Optional: Show loading state or disable buttons before fetch
		// e.g., submitter?.setAttribute('disabled', 'true');

		return async ({ result, update }) => {
			// Optional: Re-enable buttons or hide loading state
			// e.g., submitter?.removeAttribute('disabled');

			if (result.type === 'success') {
				toastManager.showSuccess('Prioritet je uspešno promenjen.', {
					dedupeKey: 'priority-swap-success'
				});
			} else if (result.type === 'failure') {
				const errorMessage = result.data?.error || 'Greška pri promeni prioriteta.';
				toastManager.showError(errorMessage, {
					dedupeKey: `priority-swap-error-${errorMessage.slice(0, 20)}`
				});
			} else if (result.type === 'error') {
				toastManager.showError(
					result.error.message || 'Nepoznata greška prilikom promene prioriteta.',
					{ dedupeKey: 'priority-swap-unexpected-error' }
				);
			}
			// Call update to refresh data from the load function
			// This is crucial for the UI to reflect the new order.
			await update({ reset: false });
		};
	};

	const handleSubmitClone: import('@sveltejs/kit').SubmitFunction = async () => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				toastManager.showSuccess('Pravilo je uspešno klonirano.', {
					dedupeKey: 'clone-success'
				});
			} else if (result.type === 'failure') {
				const errorMessage = result.data?.error || 'Greška pri kloniranju pravila.';
				toastManager.showError(errorMessage, {
					dedupeKey: `clone-error-${errorMessage.slice(0, 20)}`
				});
			} else if (result.type === 'error') {
				toastManager.showError(result.error.message || 'Nepoznata greška prilikom kloniranja.', {
					dedupeKey: 'clone-unexpected-error'
				});
			}
			await update({ reset: false });
		};
	};

	function handleEdit(id: number) {
		goto(`/crm/pricing-rules/${id}`);
	}

	function handleCreate() {
		createDialogOpen = true;
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
							<Table.Head class="w-28 text-center">Redosled</Table.Head>
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
											{#if (rule as any)[column.key]}
												{dateHelper.format((rule as any)[column.key])}
											{:else}
												-
											{/if}
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
											<DropdownMenu.Item class="gap-2 p-0">
												<form
													method="POST"
													action="?/clone"
													use:enhance={handleSubmitClone}
													class="w-full"
												>
													<input type="hidden" name="id" value={rule.id} />
													<button
														type="submit"
														class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left hover:bg-accent"
													>
														<Copy class="h-4 w-4" />
														Kloniraj
													</button>
												</form>
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
