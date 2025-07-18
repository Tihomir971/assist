<script lang="ts">
	import { page } from '$app/state';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import * as Form from '$lib/components/ui/form/index.js';

	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import { Switch } from '$lib/components/ui/switch';
	import * as Select from '$lib/components/ui/select';

	import { pricingTestSchema } from './schema';
	import type { PageData } from './$types';
	import type { PricingContext, PricingRuleMatch } from '$lib/types/pricing-rules.types';
	import { NumberInputZag } from '$lib/components/zag';
	import { Field } from 'formsnap';

	let { data }: { data: PageData } = $props();

	type TestResult = {
		context: PricingContext;
		applicableRules: PricingRuleMatch[];
		calculatedPrice: number;
		ruleTests: { rule: PricingRuleMatch; matches: boolean; price?: number; error?: string }[];
		fallbackPrice?: number;
	};

	const form = superForm(data.form, {
		validators: zod(pricingTestSchema),
		resetForm: false,
		onResult: ({ result }) => {
			if (result.type === 'failure') {
				const errorMessage =
					result.data?.error || 'Pricing test failed. Check console for details.';
				toast.error(errorMessage);
			} else if (result.type === 'success') {
				toast.success('Pricing test completed successfully');
			}
		}
	});

	const { form: formData, enhance, errors } = form;

	// Use a derived rune to react to form action data
	const results = $derived.by(() => {
		return page.form?.results as TestResult | undefined;
	});

	const roundingOptions = [
		{ value: 'none', label: 'None' },
		{ value: 'charming', label: 'Charming (.99)' }
	];

	const roundingTriggerContent = $derived(
		roundingOptions.find((o) => o.value === $formData.rounding_strategy)?.label ?? 'Select rounding'
	);
</script>

<div class="container mx-auto space-y-6 overflow-auto py-6 pb-24">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold">Pricing Rules Test</h1>
		<Badge variant="secondary">Lab Tool</Badge>
	</div>

	<div class="grid gap-6 lg:grid-cols-2">
		<!-- Test Form -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Test Parameters</Card.Title>
				<Card.Description>Enter product details to test pricing rules</Card.Description>
			</Card.Header>
			<Card.Content>
				<form method="POST" action="?/test" use:enhance class="space-y-4">
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="product_id">Product ID *</Label>
							<Input
								id="product_id"
								name="product_id"
								type="number"
								bind:value={$formData.product_id}
								placeholder="Enter product ID"
							/>
							{#if $errors.product_id}
								<span class="text-sm text-red-500">{$errors.product_id}</span>
							{/if}
						</div>
						<Form.Field {form} name="quantity">
							<Form.Control>
								{#snippet children({ props })}
									<NumberInputZag {...props} bind:value={$formData.quantity} label="Quantity" />
								{/snippet}
							</Form.Control>
							<Form.Description>Number of items to test pricing for.</Form.Description>
						</Form.Field>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<Form.Field {form} name="input_price">
							<Form.Control>
								{#snippet children({ props })}
									<NumberInputZag
										{...props}
										bind:value={$formData.input_price}
										label="Input Price"
										fraction={2}
									/>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Field {form} name="partner_id">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>Partner ID</Form.Label>
									<Input
										{...props}
										type="number"
										bind:value={$formData.partner_id}
										placeholder="Optional"
									/>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="order_value">Order Value</Label>
							<Input
								id="order_value"
								name="order_value"
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
								name="target_group"
								bind:value={$formData.target_group}
								placeholder="Optional"
							/>
						</div>
					</div>

					<Separator />

					<div class="space-y-4">
						<Form.Field {form} name="apply_vat">
							<Form.Control>
								{#snippet children({ props })}
									<Label for="apply_vat" class="flex items-center gap-2">Apply VAT</Label>
									<Switch {...props} bind:checked={$formData.apply_vat} />
								{/snippet}
							</Form.Control>
							<Form.Description>Adds VAT to the final calculated price.</Form.Description>
						</Form.Field>

						{#if $formData.apply_vat}
							<div class="space-y-2">
								<Label for="vat_rate">VAT Rate (%)</Label>
								<Input
									id="vat_rate"
									name="vat_rate"
									type="number"
									bind:value={$formData.vat_rate}
									placeholder="e.g., 20"
								/>
							</div>
						{/if}

						<div class="space-y-2">
							<Label for="rounding_strategy">Rounding Strategy</Label>
							<Select.Root
								type="single"
								value={$formData.rounding_strategy}
								onValueChange={(v) => {
									if (v) $formData.rounding_strategy = v as 'none' | 'charming';
								}}
							>
								<Select.Trigger class="w-full" id="rounding_strategy">
									{roundingTriggerContent}
								</Select.Trigger>
								<Select.Content>
									{#each roundingOptions as option}
										<Select.Item value={option.value}>{option.label}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
							<input type="hidden" name="rounding_strategy" value={$formData.rounding_strategy} />
						</div>
					</div>

					<Button type="submit" class="w-full">Test Pricing Rules</Button>
				</form>
				<!-- <SuperDebug data={{ $formData, $errors }} /> -->
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
				<div class="max-h-96 space-y-2 overflow-y-auto">
					{#each data.activeRules as rule}
						<div class="flex items-center justify-between rounded border p-2">
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
						<h3 class="mb-4 text-lg font-semibold">Applicable Rules</h3>
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
					<div class="py-8 text-center text-muted-foreground">
						<p>No applicable pricing rules found for the given parameters.</p>
						<p class="mt-2 text-sm">The fallback price will be used.</p>
					</div>
				{/if}

				<!-- Context Details -->
				<div>
					<h3 class="mb-4 text-lg font-semibold">Test Context</h3>
					<div class="grid grid-cols-2 gap-4 text-sm">
						<div><strong>Product ID:</strong> {results.context.product_id}</div>
						<div><strong>Quantity:</strong> {results.context.quantity}</div>
						<div>
							<strong>Input Price:</strong> ${results.context.input_price?.toFixed(2) || '0.00'}
						</div>
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
