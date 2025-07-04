// components/AgendaModal.tsx

import { DayPicker } from 'react-day-picker';
import {
	AlertCircleIcon,
	XIcon,
	Calendar,
	Clock,
	User,
	Scissors,
	Mars,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ALLOWED_SERVICES } from '@/constants/services';
import type { AgendaModalProps } from '@/interfaces/modal.Interface';

export default function AgendaModal({
	isOpen,
	onClose,
	onSubmit,
	initialData,
	dateError,
	hourError,
	dateTime,
	setDateTime,
	setDateTouched,
	setHourTouched,
	formik,
}: AgendaModalProps) {
	if (!isOpen) return null;

	const inputClass = (touched: boolean, error?: string) =>
		`w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-300 ${
			touched && error ? 'border-red-500 focus:ring-red-500' : ''
		}`;

	return (
		<div className="fixed inset-0 z-40 bg-gradient-to-br from-black/30 via-white/20 to-white/10 backdrop-blur-sm flex justify-center items-center px-4">
			<div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 relative shadow-2xl max-h-[95vh] overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 scrollbar-thumb-rounded">
				{/* Header */}
				<div className="text-center mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-200">
					<div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-black to-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
						<Scissors className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
					</div>
					<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
						{initialData ? 'Editar Cita' : 'Nueva Cita'}
					</h2>
					<p className="text-gray-600 text-sm sm:text-base">
						Barbería Premium - Reserva tu estilo
					</p>
					<button
						onClick={onClose}
						className="absolute top-5 right-5 sm:top-6 sm:right-6 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
						<XIcon className="w-5 h-5 sm:w-6 sm:h-6" />
					</button>
				</div>

				<form onSubmit={onSubmit} className="space-y-6 sm:space-y-8">
					{/* Secciones */}
					<div className="space-y-6">
						{/* Calendario */}
						<div className="bg-gray-50 rounded-2xl p-5 sm:p-6 border border-gray-200 space-y-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
									<Calendar className="w-5 h-5 text-white" />
								</div>
								<div>
									<h3 className="text-base sm:text-lg font-semibold text-gray-900">
										Seleccionar Fecha
									</h3>
									<p className="text-sm text-gray-600">
										Elige el día de tu cita
									</p>
								</div>
							</div>
							<div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
								<DayPicker
									mode="single"
									selected={dateTime || undefined}
									onSelect={(selected) => {
										setDateTime(selected ?? null);
										setDateTouched(true);
									}}
									locale={es}
									hidden={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
									startMonth={new Date()}
									className="text-gray-900 w-full sm:max-w-sm overflow-x-auto"
									classNames={{
										months: 'flex flex-col sm:flex-row justify-center',
										month: 'w-full',
										caption: 'text-center font-semibold text-black mb-4',
										table: 'w-full border-collapse min-w-[280px]', // 👈 evita desbordamiento
										head_row:
											'flex justify-between text-xs text-gray-400 uppercase px-2',
										row: 'flex justify-between px-2 flex-wrap', // 👈 permite que se ajuste en pantallas chicas
										cell: 'text-center w-10 h-10 flex items-center justify-center text-sm sm:text-base',
										day: 'rounded-full transition-all duration-200 hover:bg-gray-200 hover:text-black',
										day_today: 'border border-black text-black font-semibold',
										day_selected: 'bg-black text-white font-bold',
										day_outside: 'text-gray-400',
									}}
									modifiersClassNames={{
										today: 'border border-black text-black font-semibold',
										selected: 'bg-black text-white font-bold',
									}}
								/>
							</div>
							{dateError && (
								<p className="text-red-600 text-sm flex items-center gap-2">
									<AlertCircleIcon className="w-4 h-4" /> Fecha requerida
								</p>
							)}
						</div>

						{/* Hora */}
						<div className="bg-gray-50 rounded-2xl p-5 sm:p-6 border border-gray-200 space-y-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
									<Clock className="w-5 h-5 text-white" />
								</div>
								<div>
									<h3 className="text-base sm:text-lg font-semibold text-gray-900">
										Seleccionar Hora
									</h3>
									<p className="text-sm text-gray-600">
										Horario: 8:00 AM - 5:00 PM
									</p>
								</div>
							</div>
							<select
								value={dateTime ? format(dateTime, 'HH:mm') : ''}
								onChange={(e) => {
									const [hours, minutes] = e.target.value
										.split(':')
										.map(Number);
									const updated = new Date(dateTime!);
									updated.setHours(hours);
									updated.setMinutes(minutes);
									setDateTime(updated);
									setHourTouched(true);
								}}
								onBlur={() => setHourTouched(true)}
								disabled={!dateTime}
								className={`${inputClass(
									hourError,
									hourError ? 'error' : ''
								)} ${
									!dateTime ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''
								}`}>
								<option value="">Seleccionar hora</option>
								{/* generar horas disponibles */}
								{(() => {
									if (!dateTime) return null;
									const hours = [];
									const now = new Date();
									const selectedDate = dateTime;
									const isToday =
										selectedDate.toDateString() === now.toDateString();
									const currentHour = now.getHours();
									const startHour = isToday ? Math.max(currentHour + 1, 8) : 8;
									for (let hour = startHour; hour <= 17; hour++) {
										const time = `${hour.toString().padStart(2, '0')}:00`;
										hours.push(
											<option
												key={time}
												value={time}
												className="bg-white text-gray-900">
												{time}
											</option>
										);
									}
									if (hours.length === 0) {
										return (
											<option value="" disabled>
												No hay horas disponibles
											</option>
										);
									}
									return hours;
								})()}
							</select>
							{hourError && (
								<p className="text-red-600 text-sm flex items-center gap-2">
									<AlertCircleIcon className="w-4 h-4" /> Hora requerida
								</p>
							)}
						</div>
					</div>

					{/* Cliente */}
					{/* Cliente - Nombre */}
					<div className="bg-gray-50 rounded-2xl p-5 sm:p-6 border border-gray-200 space-y-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
								<User className="w-5 h-5 text-white" />
							</div>
							<div>
								<h3 className="text-base sm:text-lg font-semibold text-gray-900">
									Nombre del Cliente
								</h3>
								<p className="text-sm text-gray-600">Este campo es opcional</p>
							</div>
						</div>
						<input
							type="text"
							name="name"
							placeholder="Nombre completo (opcional)"
							value={formik.values.name}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							className={inputClass(formik.touched.name, formik.errors.name)}
						/>
					</div>

					{/* Cliente - Género */}
					<div className="bg-gray-50 rounded-2xl p-5 sm:p-6 border border-gray-200 space-y-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
								<Mars className="w-5 h-5 text-white" />
							</div>
							<div>
								<h3 className="text-base sm:text-lg font-semibold text-gray-900">
									Género *
								</h3>
								<p className="text-sm text-gray-600">Selecciona tu género</p>
							</div>
						</div>
						<select
							name="gender"
							value={formik.values.gender}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							className={inputClass(
								formik.touched.gender,
								formik.errors.gender
							)}>
							<option value="">Seleccionar género</option>
							<option value="masculino">Masculino</option>
							<option value="femenino">Femenino</option>
						</select>
						{formik.touched.gender && formik.errors.gender && (
							<p className="text-red-600 text-sm flex items-center gap-2">
								<AlertCircleIcon className="w-4 h-4" /> {formik.errors.gender}
							</p>
						)}
					</div>

					{/* Servicio */}
					<div className="bg-gray-50 rounded-2xl p-5 sm:p-6 border border-gray-200">
						<div className="flex items-center gap-3 mb-4">
							<div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
								<Scissors className="w-5 h-5 text-white" />
							</div>
							<div>
								<h3 className="text-base sm:text-lg font-semibold text-gray-900">
									Seleccionar Servicio
								</h3>
								<p className="text-sm text-gray-600">
									Elige el servicio que deseas
								</p>
							</div>
						</div>
						<select
							name="service"
							value={formik.values.service}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							className={inputClass(
								formik.touched.service,
								formik.errors.service
							)}>
							<option value="">Seleccionar servicio</option>
							{ALLOWED_SERVICES.map((service) => (
								<option key={service} value={service} className="text-gray-900">
									{service}
								</option>
							))}
						</select>
						{formik.touched.service && formik.errors.service && (
							<p className="text-red-600 text-sm mt-2 flex items-center gap-2">
								<AlertCircleIcon className="w-4 h-4" /> {formik.errors.service}
							</p>
						)}
					</div>

					{/* Botón */}
					<div className="pt-4 sm:pt-6 border-t border-gray-200">
						<button
							type="submit"
							className="w-full py-3 sm:py-4 bg-gradient-to-r from-black to-gray-800 text-white font-bold rounded-xl shadow-lg hover:from-gray-800 hover:to-black transition-all duration-300 text-base sm:text-lg">
							{initialData ? 'Actualizar Cita' : 'Confirmar Reserva'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
