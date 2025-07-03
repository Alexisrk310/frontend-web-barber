// components/AgendaModal.tsx
import { DayPicker } from 'react-day-picker';
import { AlertCircleIcon, XIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ALLOWED_SERVICES } from '@/constants/services';
import { AgendaModalProps } from '@/interfaces/modal.Interface';

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
		`w-full max-w-[400px] px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${
			touched && error ? 'border-red-500' : 'border-gray-300'
		}`;

	return (
		<div className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm flex justify-center items-center px-4">
			<div className="bg-white w-full max-w-lg rounded-2xl p-8 relative shadow-xl max-h-[95vh] overflow-y-auto">
				<button
					onClick={onClose}
					className="absolute top-4 right-4 text-gray-500 hover:text-black">
					<XIcon className="w-5 h-5" />
				</button>
				<h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
					{initialData ? 'Editar Agenda' : 'Agregar Nueva Agenda'}
				</h2>
				<form
					onSubmit={onSubmit}
					className="space-y-4 flex flex-col items-center">
					{/* Calendario */}
					<div className="w-full max-w-[400px]">
						<p className="text-sm font-medium text-gray-600 mb-2">
							Seleccionar fecha:
						</p>
						<div className="flex justify-center">
							<DayPicker
								mode="single"
								selected={dateTime || undefined}
								onSelect={(selected) => {
									setDateTime(selected ?? null);
									setDateTouched(true);
								}}
								locale={es}
								hidden={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
								startMonth={new Date()} // 👈 Bloquea la navegación hacia atrás
								modifiersClassNames={{
									selected: 'bg-black text-white',
									today: 'border border-black',
								}}
								className={`rounded-lg border p-4 shadow-sm ${
									dateError ? 'border-red-500' : 'border-gray-300'
								}`}
							/>
						</div>
						{dateError && (
							<p className="text-red-500 text-sm mt-1 flex items-center gap-1">
								<AlertCircleIcon className="w-4 h-4" /> Fecha requerida
							</p>
						)}
					</div>

					{/* Hora */}
					<div className="w-full max-w-[400px]">
						<p className="text-sm font-medium text-gray-600 mb-2">
							Seleccionar hora:
						</p>
						<select
							value={dateTime ? format(dateTime, 'HH:mm') : ''}
							onChange={(e) => {
								const [hours, minutes] = e.target.value.split(':').map(Number);
								let updated = new Date(dateTime!);
								updated.setHours(hours);
								updated.setMinutes(minutes);
								setDateTime(updated);
								setHourTouched(true);
							}}
							onBlur={() => setHourTouched(true)}
							disabled={!dateTime}
							className={`w-full max-w-[400px] px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${
								hourError ? 'border-red-500' : 'border-gray-300'
							} ${
								!dateTime ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''
							}`}>
							<option value="">Hora</option>
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
										<option key={time} value={time}>
											{time}
										</option>
									);
								}

								if (hours.length === 0) {
									return (
										<option value="" disabled>
											No hay horas disponibles para hoy
										</option>
									);
								}

								return hours;
							})()}
						</select>

						{hourError && (
							<p className="text-red-500 text-sm mt-1 flex items-center gap-1">
								<AlertCircleIcon className="w-4 h-4" /> Hora requerida
							</p>
						)}
					</div>

					{/* Nombre */}
					<input
						type="text"
						name="name"
						placeholder="Nombre del cliente (opcional)"
						value={formik.values.name}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						className={inputClass(formik.touched.name, formik.errors.name)}
					/>

					{/* Género */}
					<select
						name="gender"
						value={formik.values.gender}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						className={inputClass(formik.touched.gender, formik.errors.gender)}>
						<option value="">Seleccionar género</option>
						<option value="masculino">Masculino</option>
						<option value="femenino">Femenino</option>
					</select>
					{formik.touched.gender && formik.errors.gender && (
						<p className="text-red-500 text-sm flex items-center gap-1">
							<AlertCircleIcon className="w-4 h-4" /> {formik.errors.gender}
						</p>
					)}

					{/* Servicio */}
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
							<option key={service} value={service}>
								{service}
							</option>
						))}
					</select>
					{formik.touched.service && formik.errors.service && (
						<p className="text-red-500 text-sm flex items-center gap-1">
							<AlertCircleIcon className="w-4 h-4" /> {formik.errors.service}
						</p>
					)}

					<button
						type="submit"
						className="w-full max-w-[400px] mt-4 py-2 bg-gradient-to-r from-black via-gray-800 to-gray-700 text-white font-semibold rounded-lg shadow hover:brightness-110">
						{initialData ? 'Actualizar Agenda' : 'Agendar'}
					</button>
				</form>
			</div>
		</div>
	);
}
