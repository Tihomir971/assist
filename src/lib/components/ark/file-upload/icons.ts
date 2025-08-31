import {
	FileText,
	File as FileIcon,
	FileArchive,
	FileSpreadsheet,
	Video,
	Headphones,
	Image
} from '@lucide/svelte';

export const getFileIcon = (file: File) => {
	const fileType = file.type;
	const fileName = file.name;

	if (
		fileType.includes('pdf') ||
		fileName.endsWith('.pdf') ||
		fileType.includes('word') ||
		fileName.endsWith('.doc') ||
		fileName.endsWith('.docx')
	) {
		return FileText;
	} else if (
		fileType.includes('zip') ||
		fileType.includes('archive') ||
		fileName.endsWith('.zip') ||
		fileName.endsWith('.rar')
	) {
		return FileArchive;
	} else if (
		fileType.includes('excel') ||
		fileName.endsWith('.xls') ||
		fileName.endsWith('.xlsx')
	) {
		return FileSpreadsheet;
	} else if (fileType.includes('video/')) {
		return Video;
	} else if (fileType.includes('audio/')) {
		return Headphones;
	} else if (fileType.startsWith('image/')) {
		return Image;
	}
	return FileIcon;
};
