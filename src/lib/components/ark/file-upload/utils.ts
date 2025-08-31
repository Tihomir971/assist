const fileTypeMap = {
	excel:
		'application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	word: 'application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	image: 'image/*',
	pdf: 'application/pdf',
	video: 'video/*',
	audio: 'audio/*',
	text: 'text/plain',
	csv: 'text/csv'
};

export type FileType = keyof typeof fileTypeMap;

export const getAcceptAttribute = (fileType?: FileType): string | undefined => {
	if (!fileType) return undefined;

	const accept = fileTypeMap[fileType];
	if (!accept) return undefined;

	return accept;
};
