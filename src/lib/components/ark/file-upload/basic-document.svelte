<script lang="ts">
	import { FileUpload } from '@ark-ui/svelte/file-upload';
	import { Field } from '@ark-ui/svelte/field';

	import { FileText } from '@lucide/svelte';
	import { getFileIcon } from './icons';

	import { getAcceptAttribute } from './utils';
	import type { Props } from './types';

	let {
		fileType,
		acceptedFiles,
		onFileChange = $bindable(),
		label,
		...restProps
	}: Props = $props();
	const accept = getAcceptAttribute(fileType);
	// const id = $props.id();
</script>

<!-- {id} -->

<Field.Root class="w-full max-w-sm">
	<FileUpload.Root
		{...restProps}
		maxFiles={1}
		{accept}
		{acceptedFiles}
		{onFileChange}
		class="flex flex-col items-start gap-3"
	>
		{#if label}
			<Field.Label class="text-sm font-medium text-gray-900 dark:text-gray-100">
				{label}
			</Field.Label>
		{/if}
		<FileUpload.Context>
			{#snippet render(context)}
				<div class="flex items-center gap-3">
					<!-- Image Preview / Placeholder -->
					<div
						class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
					>
						{#if context().acceptedFiles.length > 0}
							<FileUpload.ItemGroup>
								{#each context().acceptedFiles as file (file.name)}
									<FileUpload.Item file={context().acceptedFiles[0]}>
										{#if file.type.startsWith('image/')}
											<FileUpload.ItemPreview type="image/*">
												<FileUpload.ItemPreviewImage class="h-full w-full object-cover" />
											</FileUpload.ItemPreview>
										{:else}
											{@const IconComponent = getFileIcon(file)}
											<IconComponent />
										{/if}
									</FileUpload.Item>
								{/each}
							</FileUpload.ItemGroup>
						{:else}
							<FileText class="h-5 w-5 text-gray-400 dark:text-gray-500" />
						{/if}
					</div>

					<!-- Upload/Change Button -->
					<FileUpload.Trigger
						class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:outline-hidden dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 dark:focus:ring-gray-100"
					>
						{context().acceptedFiles.length > 0 ? 'Change image' : 'Upload image'}
					</FileUpload.Trigger>
				</div>

				<!-- Filename and Remove -->
				{#if context().acceptedFiles.length > 0}
					<FileUpload.ItemGroup>
						<FileUpload.Item file={context().acceptedFiles[0]} class="flex items-center gap-2">
							<FileUpload.ItemName class="text-sm text-gray-600 dark:text-gray-400" />
							<FileUpload.ItemDeleteTrigger
								class="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
							>
								Remove
							</FileUpload.ItemDeleteTrigger>
						</FileUpload.Item>
					</FileUpload.ItemGroup>
				{/if}
			{/snippet}
		</FileUpload.Context>

		<FileUpload.HiddenInput />
	</FileUpload.Root>
</Field.Root>
