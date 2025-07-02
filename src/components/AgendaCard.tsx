import {
	UserIcon,
	CalendarDaysIcon,
	ClockIcon,
	RefreshCwIcon,
	Trash2Icon,
	PencilIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { capitalizeWords } from '@/helpers/capitalizeWords ';
import { AgendaCardProps } from '@/interfaces/appointments.Interface';

export default function AgendaCard({
	agenda,
	onEdit,
	onDelete,
}: AgendaCardProps) {
	return (
		<div className="bg-gradient-to-br from-white via-gray-100 to-white rounded-2xl shadow-xl p-6 flex flex-col gap-4 border border-gray-200 hover:shadow-2xl transition relative">
			{/* Botones de acciones */}
			<button
				onClick={() => onDelete(agenda.id)}
				className="absolute top-3 right-3 p-2 rounded-full hover:bg-red-100 transition text-red-600">
				<Trash2Icon className="w-5 h-5" />
			</button>
			<button
				onClick={() => onEdit(agenda)}
				className="absolute top-3 right-10 p-2 rounded-full hover:bg-yellow-100 transition text-yellow-600">
				<PencilIcon className="w-5 h-5" />
			</button>

			{/* Contenido de la agenda */}
			<div className="flex items-center gap-3 text-lg font-semibold text-gray-800">
				<UserIcon className="h-5 w-5 text-black" />
				{capitalizeWords(agenda.name)}
			</div>
			<div className="flex items-center gap-1 font-semibold text-gray-800">
				<span className="font-medium">Servicio:</span>{' '}
				{capitalizeWords(agenda.service)}
			</div>
			<div className="text-sm text-gray-700">
				<span className="font-medium">Género:</span>{' '}
				{capitalizeWords(agenda.gender)}
			</div>
			<div className="text-sm text-gray-700">
				<span className="font-medium">Estado:</span>{' '}
				{capitalizeWords(agenda.status)}
			</div>
			<div className="text-sm text-gray-700 flex items-start gap-2">
				<CalendarDaysIcon className="w-4 h-4 mt-0.5 text-black" />
				<span>
					<span className="font-medium">Fecha de la cita:</span>{' '}
					{format(new Date(agenda.dateTime), 'dd/MM/yyyy HH:mm', {
						locale: es,
					})}
				</span>
			</div>
			<div className="text-sm text-gray-700 flex items-start gap-2">
				<ClockIcon className="w-4 h-4 mt-0.5 text-black" />
				<span>
					<span className="font-medium">Creado el:</span>{' '}
					{format(new Date(agenda.createdAt), 'dd/MM/yyyy HH:mm', {
						locale: es,
					})}
				</span>
			</div>
			<div className="text-sm text-gray-700 flex items-start gap-2">
				<RefreshCwIcon className="w-4 h-4 mt-0.5 text-black" />
				<span>
					<span className="font-medium">Actualizado el:</span>{' '}
					{format(new Date(agenda.updatedAt), 'dd/MM/yyyy HH:mm', {
						locale: es,
					})}
				</span>
			</div>
		</div>
	);
}
