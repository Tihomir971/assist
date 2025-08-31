<script lang="ts">
	import { FileUpload } from '@ark-ui/svelte/file-upload';
	import { FileText, X } from '@lucide/svelte';
	import { getFileIcon } from './icons';

	const defaultFiles = [
		new File(['Welcome to Ark UI Svelte`'], 'document.pdf', {
			type: 'text/plain'
		}),
		new File(['Welcome to Ark UI Svelte, this is a zip file`'], 'showcase.zip', {
			type: 'application/zip'
		}),
		new File(['Welcome to Ark UI Svelte, this is an excel file`'], 'data.xlsx', {
			type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		})
	];
</script>

<FileUpload.Root
	maxFiles={10}
	maxFileSize={100 * 1024 * 1024}
	class="w-full max-w-2xl space-y-4"
	defaultAcceptedFiles={defaultFiles}
>
	<FileUpload.Context>
		{#snippet render(context)}
			<!-- Dropzone -->
			<FileUpload.Dropzone
				class="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-12 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
			>
				<!-- File Icon -->
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900"
				>
					<FileText class="h-5 w-5 text-gray-400 dark:text-gray-500" />
				</div>

				<!-- Text -->
				<div class="space-y-2 text-center">
					<h3 class="text-sm font-medium text-gray-900 dark:text-gray-100">Upload files</h3>
					<p class="text-sm text-gray-600 dark:text-gray-400">Drag & drop or click to browse</p>
					<p class="text-xs text-gray-500 dark:text-gray-400">
						All files • Max 10 files • Up to 100MB
					</p>
				</div>
			</FileUpload.Dropzone>

			<!-- Files List -->
			{#if context().acceptedFiles.length > 0}
				<div class="space-y-3">
					<FileUpload.ItemGroup>
						{#each context().acceptedFiles as file (file.name)}
							<FileUpload.Item {file}>
								<div
									class="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
								>
									<!-- File Icon/Preview -->
									<div
										class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
									>
										{#if file.type.startsWith('image/')}
											<FileUpload.ItemPreview type="image/*">
												<FileUpload.ItemPreviewImage class="h-full w-full object-cover" />
											</FileUpload.ItemPreview>
										{:else}
											{@const IconComponent = getFileIcon(file)}
											<IconComponent class="h-4 w-4 opacity-60" />
										{/if}
									</div>

									<!-- File Info -->
									<div class="min-w-0 flex-1">
										<FileUpload.ItemName
											class="truncate text-sm font-medium text-gray-900 dark:text-gray-100"
										/>
										<FileUpload.ItemSizeText class="text-xs text-gray-500 dark:text-gray-400" />
									</div>

									<!-- Delete Button -->
									<FileUpload.ItemDeleteTrigger
										class="flex h-6 w-6 shrink-0 items-center justify-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
									>
										<X class="h-4 w-4" />
									</FileUpload.ItemDeleteTrigger>
								</div>
							</FileUpload.Item>
						{/each}
					</FileUpload.ItemGroup>

					<!-- Remove All Button -->
					<FileUpload.ClearTrigger
						class="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:outline-hidden dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-gray-100"
					>
						Remove all files
					</FileUpload.ClearTrigger>
				</div>
			{/if}
		{/snippet}
	</FileUpload.Context>

	<FileUpload.HiddenInput />
</FileUpload.Root>
