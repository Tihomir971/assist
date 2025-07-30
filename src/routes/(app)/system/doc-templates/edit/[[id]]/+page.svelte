<script lang="ts">
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { docTemplateInsertSchema } from '$lib/types/supabase.zod.schemas';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Switch } from '$lib/components/ui/switch';
	import * as Card from '$lib/components/ui/card';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import { SimpleEditor } from '$lib/components/svelte-tiptap';

	let { data }: { data: PageData } = $props();

	const { form, errors, enhance, submitting } = superForm(data.form, {
		validators: zod4(docTemplateInsertSchema),
		onResult: ({ result }) => {
			if (result.type === 'success') {
				toast.success(
					data.isCreateMode ? 'Template created successfully' : 'Template updated successfully'
				);
				if (data.isCreateMode && result.data?.entity?.id) {
					goto(`/system/doc-templates/edit/${result.data.entity.id}`);
				}
			} else if (result.type === 'failure') {
				const errorMessage = result.data?.error || 'Error saving template';
				toast.error(errorMessage);
			}
		}
	});
</script>

<div class="container mx-auto py-6">
	<Card.Root>
		<Card.Header>
			<Card.Title>
				{data.isCreateMode ? 'Create Document Template' : 'Edit Document Template'}
			</Card.Title>
		</Card.Header>
		<Card.Content>
			<form method="POST" action="?/upsert" use:enhance class="space-y-6">
				<div class="grid grid-cols-12 gap-4">
					<!-- Template Name -->
					<div class="col-span-6">
						<Label for="name">Template Name</Label>
						<Input
							id="name"
							name="name"
							bind:value={$form.name}
							placeholder="e.g., Monthly Invoice"
							class={$errors.name ? 'border-red-500' : ''}
						/>
						{#if $errors.name}
							<p class="mt-1 text-sm text-red-500">{$errors.name}</p>
						{/if}
					</div>

					<!-- Active Switch -->
					<div class="col-span-6 flex items-center space-x-2">
						<Switch id="is_active" name="is_active" bind:checked={$form.is_active} />
						<Label for="is_active">Active</Label>
						{#if $errors.is_active}
							<p class="mt-1 text-sm text-red-500">{$errors.is_active}</p>
						{/if}
					</div>

					<!-- Description -->
					<div class="col-span-12">
						<Label for="description">Description</Label>
						<Textarea
							id="description"
							name="description"
							bind:value={$form.description}
							placeholder="Describe the purpose of this template"
							class={$errors.description ? 'border-red-500' : ''}
						/>
						{#if $errors.description}
							<p class="mt-1 text-sm text-red-500">{$errors.description}</p>
						{/if}
					</div>

					<!-- Template Content -->
					<div class="col-span-12">
						<Label for="content">Template Content</Label>
						<!-- <TiptapEditor bind:content={$form.content} /> -->
						<!-- <TipTapEditor2 bind:content={$form.content} /> -->
						<SimpleEditor bind:content={$form.content} />
						<input type="hidden" name="content" bind:value={$form.content} />
						<p class="mt-1 text-sm text-muted-foreground">
							Use Mustache syntax. Example: &lt;h1&gt;Invoice for
							&#123;&#123;customer.display_name&#125;&#125;&lt;/h1&gt;
						</p>
						{#if $errors.content}
							<p class="mt-1 text-sm text-red-500">{$errors.content}</p>
						{/if}
					</div>

					<!-- Context Schema -->
					<div class="col-span-12">
						<Label for="context_schema">Context Schema (JSON)</Label>
						<Textarea
							id="context_schema"
							name="context_schema"
							bind:value={$form.context_schema}
							rows={10}
							placeholder={'{ "roles": [{ "name": "customer", "label": "Customer", "source_table": "c_bpartner" }] }'}
							class={$errors.context_schema ? 'border-red-500' : ''}
						/>
						<p class="mt-1 text-sm text-muted-foreground">
							Defines the data roles. Example: &#123; "roles": [&#123; "name": "customer", "label":
							"Customer", "source_table": "c_bpartner" &#125;] &#125;
						</p>
						{#if $errors.context_schema}
							<p class="mt-1 text-sm text-red-500">{$errors.context_schema}</p>
						{/if}
					</div>
				</div>

				<!-- Form Actions -->
				<div class="flex items-center justify-between border-t pt-6">
					<div>
						{#if !data.isCreateMode}
							<Button
								type="submit"
								formaction="?/delete"
								variant="destructive"
								disabled={$submitting}
							>
								Delete Template
							</Button>
						{/if}
					</div>
					<div class="flex gap-2">
						<Button type="button" variant="outline" onclick={() => goto('/system/doc-templates')}>
							Cancel
						</Button>
						<Button type="submit" disabled={$submitting}>
							{$submitting
								? 'Saving...'
								: data.isCreateMode
									? 'Create Template'
									: 'Update Template'}
						</Button>
					</div>
				</div>
			</form>
			<SuperDebug data={{ $form, $errors }} />
		</Card.Content>
	</Card.Root>
</div>
