export interface AgendaModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
	initialData?: {
		name: string;
		gender: string;
		service: string;
		dateTime: Date;
	};
	dateError: boolean;
	hourError: boolean;
	dateTime: Date | null;
	setDateTime: (date: Date | null) => void;
	setDateTouched: (v: boolean) => void;
	setHourTouched: (v: boolean) => void;
	formik?: any;
}

export interface ConfirmModalProps {
	title: string;
	description?: string;
	isOpen: boolean;
	onCancel: () => void;
	onConfirm: () => void;
	confirmText?: string;
	cancelText?: string;
}
