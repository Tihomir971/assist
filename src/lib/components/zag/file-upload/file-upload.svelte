<script lang="ts">
	import './file-upload.css';
	import * as fileUpload from '@zag-js/file-upload';
	import { normalizeProps, useMachine } from '@zag-js/svelte';
	import type { FileUploadProps } from './types';
	import PhX from '~icons/ph/x';

	let {
		id,
		label,
		disabled,
		'aria-describedby': ariaDescribedBy,
		'aria-invalid': ariaInvalid,
		'aria-required': ariaRequired,
		...restProps
	}: FileUploadProps = $props();

	const localId = $props.id();
	const service = useMachine(fileUpload.machine, {
		id: id ?? localId,
		get disabled() {
			return disabled;
		},
		...restProps
	});

	const api = $derived(fileUpload.connect(service, normalizeProps));
</script>

<div {...api.getRootProps()}>
	{#if label}
		<label {...api.getLabelProps}>{label}</label>
	{/if}
	<div {...api.getDropzoneProps()}>
		<input {...api.getHiddenInputProps()} />
		<span>Drag and Drop or</span>
		<button {...api.getTriggerProps()}>Choose File</button>
		<span>to upload</span>
	</div>

	<ul {...api.getItemGroupProps()}>
		{#each api.acceptedFiles as file}
			<li {...api.getItemProps({ file })}>
				<div>
					{file.name}
					<span {...api.getItemSizeTextProps({ file })}>{api.getFileSize(file)}</span>
				</div>
				<button {...api.getItemDeleteTriggerProps({ file })} class="cursor-pointer"><PhX /></button>
			</li>
		{/each}
	</ul>
</div>
