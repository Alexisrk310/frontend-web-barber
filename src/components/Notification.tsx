import {
	CheckCircleIcon,
	AlertCircleIcon,
	InfoIcon,
	AlertTriangleIcon,
	XIcon,
} from 'lucide-react';
import { JSX, useEffect } from 'react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationProps {
	message: string;
	type?: NotificationType;
	onClose: () => void;
}

const iconMap: Record<NotificationType, JSX.Element> = {
	success: <CheckCircleIcon className="w-5 h-5 text-green-100" />,
	error: <AlertCircleIcon className="w-5 h-5 text-red-100" />,
	info: <InfoIcon className="w-5 h-5 text-blue-100" />,
	warning: <AlertTriangleIcon className="w-5 h-5 text-yellow-900" />,
};

const styleMap: Record<
	NotificationType,
	{ bg: string; text: string; iconColor?: string }
> = {
	success: {
		bg: 'bg-green-600',
		text: 'text-white',
	},
	error: {
		bg: 'bg-red-600',
		text: 'text-white',
	},
	info: {
		bg: 'bg-blue-600',
		text: 'text-white',
	},
	warning: {
		bg: 'bg-yellow-300',
		text: 'text-black',
	},
};

export default function Notification({
	message,
	type = 'info',
	onClose,
}: NotificationProps) {
	useEffect(() => {
		const timer = setTimeout(onClose, 3000);
		return () => clearTimeout(timer);
	}, [onClose]);

	const { bg, text } = styleMap[type];

	return (
		<div
			className={`fixed top-6 right-6 px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-fade-in transition-all ${bg} ${text}`}>
			{iconMap[type]}
			<span className="text-sm font-medium flex-1">{message}</span>
			<button
				onClick={onClose}
				className="hover:opacity-80 transition-opacity duration-200">
				<XIcon className="w-4 h-4" />
			</button>
		</div>
	);
}
