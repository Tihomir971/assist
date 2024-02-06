const DIALOG_NAMES = ['settings', 'login', 'delete'] as const;
type DialogName = (typeof DIALOG_NAMES)[number];

export type { DialogName };
