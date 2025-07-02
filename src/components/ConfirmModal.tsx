import React from 'react';
import { XIcon } from 'lucide-react';

interface ConfirmModalProps {
	title: string;
	description?: string;
	isOpen: boolean;
	onCancel: () => void;
	onConfirm: () => void;
	confirmText?: string;
	cancelText?: string;
}

export default function ConfirmModal({
	title,
	description,
	isOpen,
	onCancel,
	onConfirm,
	confirmText = 'Confirmar',
	cancelText = 'Cancelar',
}: ConfirmModalProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center px-4">
			<div className="bg-white max-w-md w-full rounded-xl shadow-lg p-6 relative">
				<button
					onClick={onCancel}
					className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition">
					<XIcon className="w-5 h-5" />
				</button>

				<h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
				{description && (
					<p className="text-sm text-gray-600 mb-4">{description}</p>
				)}

				<div className="flex justify-end gap-3 mt-6">
					<button
						onClick={onCancel}
						className="px-4 py-2 rounded-md text-sm border border-gray-300 hover:bg-gray-100 transition">
						{cancelText}
					</button>
					<button
						onClick={onConfirm}
						className="px-4 py-2 rounded-md text-sm bg-red-600 text-white hover:bg-red-700 transition">
						{confirmText}
					</button>
				</div>
			</div>
		</div>
	);
}
