import type { FileUploadRootProps } from '@ark-ui/svelte/file-upload';
import type { FileType } from './utils';

export interface FileUploadRootPropsExtended extends FileUploadRootProps {
	fileType: FileType;
	label: string;
}
