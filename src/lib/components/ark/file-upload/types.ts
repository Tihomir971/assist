import type { FileUploadRootProps } from '@ark-ui/svelte/file-upload';
import type { FileType } from './utils';

export type Props = {
	fileType: FileType;
	acceptedFiles?: FileUploadRootProps['acceptedFiles'];
	onFileChange?: FileUploadRootProps['onFileChange'];
	label?: string;
};
export interface FileUploadRootPropsExtended extends FileUploadRootProps {
	fileType: FileType;
	label: string;
}
