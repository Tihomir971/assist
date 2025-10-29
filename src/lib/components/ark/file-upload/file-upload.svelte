<script lang="ts">
	import { FileUpload, useFileUpload, type UseFileUploadProps } from '@ark-ui/svelte/file-upload';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';

	import PhUploadSimple from '~icons/ph/upload-simple';
	import PhFileXls from '~icons/ph/file-xls';
	import PhX from '~icons/ph/x';
	import { getAcceptAttribute, type FileType } from './utils';

	type Props = UseFileUploadProps & {
		label?: string;
		fileType: FileType;
	};
	let { label = 'File Upload', fileType, onFileChange, disabled, ...restProps }: Props = $props();
	const accept = getAcceptAttribute(fileType);

	const id = $props.id();
	const fileUpload = useFileUpload({
		id,
		maxFiles: 1,
		onFileChange,
		accept,
		get disabled() {
			return disabled;
		},
		...restProps
	});
</script>

<FileUpload.RootProvider value={fileUpload} class="flex max-w-md flex-col gap-1.5">
	{#if label}
		<FileUpload.Label>{label}</FileUpload.Label>
	{/if}
	<InputGroup.Root>
		<FileUpload.ItemGroup class="flex-1 px-3 py-2">
			<FileUpload.Context>
				{#snippet render(context)}
					{#each context().acceptedFiles as file (file.name)}
						<FileUpload.Item {file} class="flex items-center gap-1.5 text-sm">
							<FileUpload.ItemPreview
								type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
							>
								<PhFileXls />
							</FileUpload.ItemPreview>
							<FileUpload.ItemName />
							<FileUpload.ItemSizeText />
						</FileUpload.Item>
					{/each}
				{/snippet}
			</FileUpload.Context>
		</FileUpload.ItemGroup>
		<InputGroup.Addon align="inline-end">
			{#if fileUpload().acceptedFiles.length > 0}
				<InputGroup.Button
					onclick={(e) => {
						e.stopPropagation();
						fileUpload().clearFiles();
					}}
					variant="ghost"
					size="icon-xs"
				>
					<PhX />
				</InputGroup.Button>
			{:else}
				<FileUpload.Trigger class="cursor-pointer rounded-sm hover:bg-accent">
					{#snippet asChild(props)}
						<InputGroup.Button {...props()} variant="ghost" size="icon-xs">
							<PhUploadSimple />
						</InputGroup.Button>
					{/snippet}
				</FileUpload.Trigger>
			{/if}
		</InputGroup.Addon>
	</InputGroup.Root>
	<FileUpload.HiddenInput />
</FileUpload.RootProvider>
