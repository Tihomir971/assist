export const COMMUNICATION_TYPES = {
	CALL: 'call',
	EMAIL: 'email',
	MEETING: 'meeting',
	MESSAGE: 'message',
	NOTE: 'note'
};

export const COMMUNICATION_TYPE_OPTIONS = [
	{ value: 'call', label: 'Call', icon: '📞' },
	{ value: 'email', label: 'Email', icon: '📧' },
	{ value: 'meeting', label: 'Meeting', icon: '🤝' },
	{ value: 'chat', label: 'Chat', icon: '💬' },
	{ value: 'note', label: 'Beleška', icon: '📝' }
];

// Validacija
export const isValidCommunicationType = (type: string) => {
	return Object.values(COMMUNICATION_TYPES).includes(type);
};
