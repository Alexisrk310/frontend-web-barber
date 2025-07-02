import { CheckCircleIcon } from 'lucide-react';
import { useEffect } from 'react';

function Notification({
	message,
	onClose,
}: {
	message: string;
	onClose: () => void;
}) {
	useEffect(() => {
		const timer = setTimeout(onClose, 3000);
		return () => clearTimeout(timer);
	}, [onClose]);

	return (
		<div className="fixed top-6 right-6 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
			<CheckCircleIcon className="w-5 h-5" />
			<span>{message}</span>
		</div>
	);
}
export default Notification;