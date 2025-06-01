import type { ControlAttrs } from 'formsnap';
import * as fileUpload from '@zag-js/file-upload';

export interface FileUploadProps
	extends Partial<Omit<ControlAttrs, 'data-fs-control' | 'data-fs-error'>>,
		Pick<
			fileUpload.Props,
			| 'accept'
			| 'maxFileSize'
			| 'maxFiles'
			| 'disabled'
			| 'required'
			| 'onFileChange'
			| 'getRootNode'
		> {
	label?: string;
}
