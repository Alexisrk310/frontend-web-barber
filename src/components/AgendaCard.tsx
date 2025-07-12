'use client';

import {
	UserIcon,
	CalendarDaysIcon,
	ClockIcon,
	RefreshCwIcon,
	Trash2Icon,
	PencilIcon,
	Scissors,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { capitalizeWords } from '@/helpers/capitalizeWords ';
import type { AgendaCardProps } from '@/interfaces/appointments.Interface';

export default function AgendaCard({
	agenda,
	onEdit,
	onDelete,
}: AgendaCardProps) {
	// Función para obtener el color del estado
	const getStatusColor = (status: string) => {
		const normalizedStatus = status.toLowerCase();

		switch (normalizedStatus) {
			case 'pendiente':
				return 'text-yellow-500'; // amarillo cálido
			case 'confirmado':
				return 'text-blue-500'; // azul fuerte
			case 'en curso':
				return 'text-emerald-500'; // verde moderno
			case 'completado':
				return 'text-gray-300'; // gris claro (tipo desactivado)
			default:
				return 'text-gray-400';
		}
	};

	return (
		<div className="group relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-700 hover:border-gray-500 transition-all duration-300 hover:shadow-2xl hover:shadow-white/10">
			{/* Efecto de brillo sutil */}
			<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

			{/* Botones de acciones */}
			<div className="absolute top-4 right-4 flex gap-2 z-20">
				<button
					onClick={() => onEdit(agenda)}
					className="p-2 rounded-full bg-yellow-500/20 hover:bg-yellow-500/30 transition-colors border border-yellow-500/30 hover:border-yellow-500/50"
					title="Editar cita">
					<PencilIcon className="w-4 h-4 text-yellow-400" />
				</button>
				<button
					onClick={() => onDelete(agenda.id)}
					className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors border border-red-500/30 hover:border-red-500/50"
					title="Eliminar cita">
					<Trash2Icon className="w-4 h-4 text-red-400" />
				</button>
			</div>

			{/* Header con nombre del cliente */}
			<div className="relative z-10 mb-6">
				<div className="flex items-center gap-3 mb-2">
					<div className="w-10 h-10 bg-gradient-to-br from-white to-gray-300 rounded-full flex items-center justify-center shadow-lg">
						<UserIcon className="w-5 h-5 text-black" />
					</div>
					<div>
						<h3 className="text-xl font-bold text-white">
							{capitalizeWords(agenda.name)}
						</h3>
						<div className="w-12 h-0.5 bg-gradient-to-r from-white to-transparent rounded-full mt-1" />
					</div>
				</div>
			</div>

			{/* Contenido principal */}
			<div className="relative z-10 space-y-4">
				{/* Servicio destacado */}
				<div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700">
					<div className="flex items-center gap-3">
						<Scissors className="w-5 h-5 text-gray-300" />
						<div>
							<p className="text-gray-400 text-sm">Servicio</p>
							<p className="text-white font-semibold text-lg">
								{capitalizeWords(agenda.service)}
							</p>
						</div>
					</div>
				</div>

				{/* Información adicional */}
				<div className="grid grid-cols-2 gap-3">
					<div className="text-center p-3 bg-gray-800/50 rounded-lg border border-gray-700">
						<p className="text-gray-400 text-xs">Género</p>
						<p className="text-white font-medium">
							{capitalizeWords(agenda.gender)}
						</p>
					</div>
					<div className="text-center p-3 bg-gray-800/50 rounded-lg border border-gray-700">
						<p className="text-gray-400 text-xs">Estado</p>
						<p className={`font-medium ${getStatusColor(agenda.status)}`}>
							{capitalizeWords(agenda.status)}
						</p>
					</div>
				</div>

				{/* Fechas */}
				<div className="space-y-3 pt-2 border-t border-gray-700">
					<div className="flex items-center gap-3 text-gray-300">
						<CalendarDaysIcon className="w-4 h-4 text-gray-400" />
						<div>
							<p className="text-gray-400 text-xs">Fecha de la cita</p>
							<p className="text-white font-medium">
								{format(new Date(agenda.dateTime), 'dd/MM/yyyy h:mm a', {
									locale: es,
								})}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-3 text-gray-300">
						<ClockIcon className="w-4 h-4 text-gray-400" />
						<div>
							<p className="text-gray-400 text-xs">Creado el</p>
							<p className="text-gray-300 text-sm">
								{format(new Date(agenda.createdAt), 'dd/MM/yyyy h:mm a', {
									locale: es,
								})}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-3 text-gray-300">
						<RefreshCwIcon className="w-4 h-4 text-gray-400" />
						<div>
							<p className="text-gray-400 text-xs">Actualizado el</p>
							<p className="text-gray-300 text-sm">
								{format(new Date(agenda.updatedAt), 'dd/MM/yyyy h:mm a', {
									locale: es,
								})}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Indicador de estado en la parte inferior */}
			<div
				className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl ${
					agenda.status.toLowerCase() === 'pendiente'
						? 'bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300'
						: agenda.status.toLowerCase() === 'activo'
						? 'bg-gradient-to-r from-green-500 via-green-400 to-green-300'
						: 'bg-gradient-to-r from-gray-500 via-gray-400 to-gray-300'
				}`}
			/>
		</div>
	);
}
