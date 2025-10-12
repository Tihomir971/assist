<script lang="ts">
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { docTemplateInsertSchema } from '$lib/types/zod.schemas';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Switch } from '$lib/components/ui/switch';
	import * as Card from '$lib/components/ui/card';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	// import { SimpleEditor } from '$lib/components/svelte-tiptap';
	import type { Editor } from '@tiptap/core';
	import {
		EdraBubbleMenu,
		EdraEditor,
		EdraToolBar,
		EdraDragHandleExtended
	} from '$lib/edra/shadcn/index.js';
	import DragHandle from '$lib/edra/components/DragHandle.svelte';
	let editor = $state<Editor>();

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
						<!-- <SimpleEditor bind:content={$form.content} /> -->
						{#if editor && !editor.isDestroyed}
							<EdraToolBar
								class="flex w-full items-center overflow-x-auto border-b border-dashed bg-secondary/50 p-0.5"
								{editor}
							/>
							<EdraDragHandleExtended {editor} />
							<!-- <DragHandle {editor} /> -->
							<!-- Add bubble menu -->
							<EdraBubbleMenu {editor} class="bg-popover" />
						{/if}
						<EdraEditor
							bind:editor
							content={$form.content}
							class="h-[60rem] max-h-screen overflow-y-scroll pr-2 pl-6"
							onUpdate={() => {
								if (!editor) return;
								$form.content = editor.getHTML();
							}}
						/>
						<input type="hidden" name="content" bind:value={$form.content} />
						<div class="mt-2 space-y-2">
							<p class="text-sm text-muted-foreground">
								Use Mustache syntax for dynamic content. Supports both simple variables and complex
								nested data from linked tables.
							</p>

							<details class="text-sm">
								<summary class="cursor-pointer font-medium text-blue-600 hover:text-blue-800">
									📝 Template Syntax Examples
								</summary>
								<div class="mt-2 rounded border p-3">
									<div class="space-y-3 text-xs">
										<div>
											<strong>Basic Variables:</strong>
											<pre class="mt-1 rounded border p-2"><code
													>&lt;h1&gt;Invoice for &#123;&#123;customer.display_name&#125;&#125;&lt;/h1&gt;
&lt;p&gt;Email: &#123;&#123;customer.email&#125;&#125;&lt;/p&gt;</code
												></pre>
										</div>

										<div>
											<strong>Conditional Content:</strong>
											<pre class="mt-1 rounded border p-2"><code
													>&#123;&#123;#customer.iscustomer&#125;&#125;
		&lt;p&gt;This is a customer&lt;/p&gt;
&#123;&#123;/customer.iscustomer&#125;&#125;

&#123;&#123;^customer.iscustomer&#125;&#125;
		&lt;p&gt;This is not a customer&lt;/p&gt;
&#123;&#123;/customer.iscustomer&#125;&#125;</code
												></pre>
										</div>

										<div>
											<strong>Looping Through Linked Data:</strong>
											<pre class="mt-1 rounded border p-2"><code
													>&#123;&#123;#customer.locations&#125;&#125;
		&lt;div class="location"&gt;
				&lt;h3&gt;&#123;&#123;name&#125;&#125;&lt;/h3&gt;
				&lt;p&gt;&#123;&#123;l_location.street_address_1&#125;&#125;&lt;/p&gt;
				&#123;&#123;#l_location.street_address_2&#125;&#125;
						&lt;p&gt;&#123;&#123;l_location.street_address_2&#125;&#125;&lt;/p&gt;
				&#123;&#123;/l_location.street_address_2&#125;&#125;
				&lt;p&gt;Phone: &#123;&#123;phone&#125;&#125;&lt;/p&gt;
				&#123;&#123;#isbillto&#125;&#125;&lt;span&gt;Billing Address&lt;/span&gt;&#123;&#123;/isbillto&#125;&#125;
		&lt;/div&gt;
&#123;&#123;/customer.locations&#125;&#125;</code
												></pre>
										</div>

										<div>
											<strong>Empty State Handling:</strong>
											<pre class="mt-1 rounded border p-2"><code
													>&#123;&#123;^customer.locations&#125;&#125;
		&lt;p&gt;No locations found for this customer.&lt;/p&gt;
&#123;&#123;/customer.locations&#125;&#125;</code
												></pre>
										</div>
									</div>
								</div>
							</details>

							<div class="rounded border border-green-200 bg-green-50 p-2">
								<p class="text-xs text-green-800">
									💡 <strong>Pro Tip:</strong> Use the enhanced context schema to access related data
									like customer locations, order items, or any other linked tables in your database.
								</p>
							</div>
						</div>
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
						<div class="mt-2 space-y-2">
							<p class="text-sm text-muted-foreground">
								Defines the data roles and their relationships. Supports both simple and enhanced
								schemas with linked tables.
							</p>

							<details class="text-sm">
								<summary class="cursor-pointer font-medium text-blue-600 hover:text-blue-800">
									📖 Simple Schema Example (Basic Usage)
								</summary>
								<div class="mt-2 rounded border p-3">
									<pre class="overflow-x-auto text-xs"><code
											>&#123;
		"roles": [
				&#123;
						"name": "customer",
						"label": "Customer",
						"source_table": "c_bpartner"
				&#125;
		]
&#125;</code
										></pre>
									<p class="mt-2 text-xs text-gray-600">
										Template usage: <code>&#123;&#123;customer.display_name&#125;&#125;</code>,
										<code>&#123;&#123;customer.email&#125;&#125;</code>
									</p>
								</div>
							</details>

							<details class="text-sm">
								<summary class="cursor-pointer font-medium text-green-600 hover:text-green-800">
									🚀 Native Supabase JS Format (Recommended)
								</summary>
								<div class="mt-2 rounded border border-green-200 bg-green-50 p-3">
									<pre class="overflow-x-auto text-xs"><code
											>&#123;
		"roles": [
				&#123;
						"name": "customer",
						"label": "Customer",
						"query": &#123;
								"from": "c_bpartner",
								"select": "*, c_bpartner_location(name, phone, phone2, isbillto, isshipto, l_location(street_address_1, street_address_2))",
								"eq": ["id", "$entityId"],
								"c_bpartner_location.eq": ["is_active", true],
								"c_bpartner_location.order": "name"
						&#125;
				&#125;
		]
&#125;</code
										></pre>
									<p class="mt-2 text-xs text-green-800">
										<strong>✨ Native Format:</strong> Uses familiar Supabase JS client syntax for maximum
										power and intuition.
									</p>
									<p class="mt-1 text-xs text-green-800">
										Template usage: <code>&#123;&#123;customer.display_name&#125;&#125;</code>,
										<code
											>&#123;&#123;#customer.c_bpartner_location&#125;&#125;&#123;&#123;name&#125;&#125;
											-
											&#123;&#123;l_location.street_address_1&#125;&#125;&#123;&#123;/customer.c_bpartner_location&#125;&#125;</code
										>
									</p>
									<p class="mt-1 text-xs text-green-800">
										<strong>Features:</strong> All Supabase filters (eq, neq, gt, gte, lt, lte, like,
										ilike, in), nested filtering, $entityId placeholder
									</p>
								</div>
							</details>

							<details class="text-sm">
								<summary class="cursor-pointer font-medium text-blue-600 hover:text-blue-800">
									🔗 Legacy Custom DSL (Still Supported)
								</summary>
								<div class="mt-2 rounded border p-3">
									<pre class="overflow-x-auto text-xs"><code
											>&#123;
		"roles": [
				&#123;
						"name": "customer",
						"label": "Customer",
						"source_table": "c_bpartner",
						"linked_tables": [
								&#123;
									 "name": "locations",
									 "from": "c_bpartner_location",
									 "join_on": "c_bpartner_id",
									 "to": "l_location",
									 "to_key": "l_location_id",
									 "fields": [
									   "name",
									   "phone",
									   "phone2",
									   "isbillto",
									   "isshipto",
									   "l_location.street_address_1",
									   "l_location.street_address_2"
									 ],
									 "where": "is_active = true",
									 "order": "name"
								&#125;
						]
				&#125;
		]
&#125;</code
										></pre>
									<p class="mt-2 text-xs text-gray-600">
										<strong>Legacy Format:</strong> Custom DSL with intuitive field names. Still supported
										but native format is recommended.
									</p>
									<p class="mt-1 text-xs text-gray-600">
										Template usage: <code>&#123;&#123;customer.display_name&#125;&#125;</code>,
										<code
											>&#123;&#123;#customer.locations&#125;&#125;&#123;&#123;name&#125;&#125; -
											&#123;&#123;l_location.street_address_1&#125;&#125;&#123;&#123;/customer.locations&#125;&#125;</code
										>
									</p>
								</div>
							</details>

							<details class="text-sm">
								<summary class="cursor-pointer font-medium text-green-600 hover:text-green-800">
									📝 Template Variables Guide
								</summary>
								<div class="mt-2 rounded border bg-green-50 p-3 dark:bg-green-800">
									<div class="space-y-2 text-xs">
										<div>
											<strong>Simple Schema Variables:</strong>
											<ul class="mt-1 ml-4 list-disc">
												<li>
													<code>&#123;&#123;customer.display_name&#125;&#125;</code> - Customer name
												</li>
												<li>
													<code>&#123;&#123;customer.email&#125;&#125;</code> - Customer email
												</li>
												<li>
													<code>&#123;&#123;customer.iscustomer&#125;&#125;</code> - Boolean fields
												</li>
											</ul>
										</div>
										<div>
											<strong>Enhanced Schema Variables (with locations):</strong>
											<ul class="mt-1 ml-4 list-disc">
												<li>
													<code
														>&#123;&#123;#customer.locations&#125;&#125;...&#123;&#123;/customer.locations&#125;&#125;</code
													> - Loop through locations
												</li>
												<li>
													<code>&#123;&#123;customer.locations.0.name&#125;&#125;</code> - First location
													name
												</li>
												<li>
													<code>&#123;&#123;customer.locations.0.phone&#125;&#125;</code> - First location
													phone
												</li>
												<li>
													<code
														>&#123;&#123;customer.locations.0.l_location.street_address_1&#125;&#125;</code
													> - Address from linked table
												</li>
												<li>
													<code
														>&#123;&#123;#customer.locations.0.isbillto&#125;&#125;Billing&#123;&#123;/customer.locations.0.isbillto&#125;&#125;</code
													> - Conditional display
												</li>
											</ul>
										</div>
										<div>
											<strong>System Variables:</strong>
											<ul class="mt-1 ml-4 list-disc">
												<li>
													<code>&#123;&#123;generated_at&#125;&#125;</code> - Document generation timestamp
												</li>
											</ul>
										</div>
									</div>
								</div>
							</details>

							<details class="text-sm">
								<summary class="cursor-pointer font-medium text-purple-600 hover:text-purple-800">
									⚙️ Schema Configuration Options - Ultra-Simplified Format
								</summary>
								<div class="mt-2 rounded border bg-purple-50 p-3 dark:bg-purple-800">
									<div class="space-y-3 text-xs">
										<div>
											<strong>Required Fields:</strong>
											<ul class="mt-1 ml-4 list-disc">
												<li><code>"name"</code> - Unique identifier (e.g., "locations")</li>
												<li>
													<code>"from"</code> - Source/join table (e.g., "c_bpartner_location")
												</li>
												<li><code>"join_on"</code> - Join field (e.g., "c_bpartner_id")</li>
												<li><code>"fields"</code> - Array of fields to select</li>
											</ul>
										</div>
										<div>
											<strong>Optional Fields:</strong>
											<ul class="mt-1 ml-4 list-disc">
												<li>
													<code>"to"</code> - Target table for additional data (e.g., "l_location")
												</li>
												<li>
													<code>"to_key"</code> - Foreign key to target table (e.g., "l_location_id")
												</li>
												<li>
													<code>"where"</code> - Simple where clause (e.g., "is_active = true")
												</li>
												<li>
													<code>"order"</code> - Simple order clause (e.g., "name" or "name desc")
												</li>
											</ul>
										</div>
										<div>
											<strong>Field Selection Rules:</strong>
											<ul class="mt-1 ml-4 list-disc">
												<li>
													<strong>Join table fields:</strong> Use field name directly ("name", "phone")
												</li>
												<li>
													<strong>Target table fields:</strong> Use dot notation ("l_location.street_address_1")
												</li>
												<li>
													<strong>Mixed fields:</strong> Combine both in the same "fields" array
												</li>
											</ul>
										</div>
										<div>
											<strong>Where Clause Examples:</strong>
											<ul class="mt-1 ml-4 list-disc">
												<li><code>"is_active = true"</code> - Boolean condition</li>
												<li><code>"status = 'active'"</code> - String condition</li>
												<li><code>"priority > 5"</code> - Number condition</li>
											</ul>
										</div>
										<div>
											<strong>Order Clause Examples:</strong>
											<ul class="mt-1 ml-4 list-disc">
												<li><code>"name"</code> - Ascending order</li>
												<li><code>"name desc"</code> - Descending order</li>
												<li><code>"created_at desc"</code> - Date descending</li>
											</ul>
										</div>
									</div>
								</div>
							</details>

							<div class="rounded border border-blue-200 bg-blue-50 p-2 dark:bg-blue-800">
								<p class="text-xs text-blue-900 dark:text-blue-50">
									💡 <strong>Tip:</strong> The system automatically detects enhanced schemas and maintains
									backward compatibility. Existing simple schemas continue to work without changes.
								</p>
							</div>
						</div>
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
