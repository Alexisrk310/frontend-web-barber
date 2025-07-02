import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
	UserIcon,
	CalendarDaysIcon,
	ClockIcon,
	RefreshCwIcon,
	PlusCircleIcon,
	XIcon,
	ScissorsIcon,
	CheckCircleIcon,
	AlertCircleIcon,
	Trash2Icon,
	Star,
	PencilIcon,
	LogOut,
} from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useApi } from '../hooks/useApi';
import { capitalizeWords } from '@/helpers/capitalizeWords ';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import ConfirmModal from '@/components/ConfirmModal';
import { useNavigate } from 'react-router-dom';
import { log } from 'console';
import { useAuthStore } from '@/store/useAuthStore';

interface Agenda {
	id: number;
	dateTime: string;
	status: string;
	gender: string;
	service: string;
	createdAt: string;
	updatedAt: string;
	name: string;
}
export const ALLOWED_SERVICES = [
	'Corte de cabello',
	'Barba',
	'Corte + Barba',
	'Tintura',
	'Peinado',
	'Tratamiento capilar',
	'Depilación',
	'Diseño de cejas',
	'Alisado',
];
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

export default function AgendasPage(): React.JSX.Element {
	const [agendas, setAgendas] = useState<Agenda[]>([]);
	const [showModal, setShowModal] = useState(false);
	const [dateTime, setDateTime] = useState<Date | null>(null);
	const [dateTouched, setDateTouched] = useState(false);
	const [hourTouched, setHourTouched] = useState(false);
	const [loading, setLoading] = useState(true);
	const [showNotification, setShowNotification] = useState(false);
	const [editingAgenda, setEditingAgenda] = useState<Agenda | null>(null);

	const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
	const [confirmLogout, setConfirmLogout] = useState(false);
	const [selectedIdToDelete, setSelectedIdToDelete] = useState<number | null>(
		null
	);
	const navigate = useNavigate();
	const {
		getAppointments,
		createAppointment,
		deleteOwnAppointment,
		updateOwnAppointment,
	} = useApi();

	useEffect(() => {
		const fetchData = async () => {
			try {
				const data = await getAppointments();
				setAgendas(Array.isArray(data.appointments) ? data.appointments : []);
			} catch (err) {
				console.error('Error al cargar agendas:', err);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	useEffect(() => {
		document.body.style.overflow = showModal ? 'hidden' : 'auto';
		return () => {
			document.body.style.overflow = 'auto';
		};
	}, [showModal]);

	const confirmDelete = (id: number) => {
		setSelectedIdToDelete(id);
		setConfirmDeleteOpen(true);
	};

	const handleConfirmedDelete = async () => {
		if (selectedIdToDelete !== null) {
			try {
				await deleteOwnAppointment(selectedIdToDelete);
				setAgendas((prev) =>
					prev.filter((agenda) => agenda.id !== selectedIdToDelete)
				);
				setShowNotification(true);
			} catch (err) {
				console.error('Error al eliminar la agenda:', err);
			} finally {
				setConfirmDeleteOpen(false);
				setSelectedIdToDelete(null);
			}
		}
	};

	const resetModal = () => {
		setShowModal(false);
		setDateTime(null);
		setDateTouched(false);
		setHourTouched(false);
		setEditingAgenda(null);
		formik.resetForm();
	};

	const formik = useFormik({
		initialValues: {
			name: '',
			gender: '',
			service: '',
		},
		validationSchema: Yup.object({
			name: Yup.string().optional(),
			gender: Yup.string().required('Género requerido'),
			service: Yup.string().required('Servicio requerido'),
		}),
		onSubmit: async (values) => {
			setDateTouched(true);
			setHourTouched(true);

			const isValidDate = !!dateTime;
			const isValidHour =
				dateTime instanceof Date &&
				!isNaN(dateTime.getHours()) &&
				dateTime.getHours() >= 8 &&
				dateTime.getHours() <= 17;

			if (!isValidDate || !isValidHour || !values.gender || !values.service)
				return;

			try {
				const formattedDate = format(dateTime, 'dd/MM/yyyy HH:mm');

				if (editingAgenda) {
					// MODO EDITAR
					const updated = await updateOwnAppointment(editingAgenda.id, {
						...values,
						dateTime: formattedDate as unknown as Date,
					});
					setAgendas((prev) =>
						prev.map((item) =>
							item.id === editingAgenda.id ? updated.appointment : item
						)
					);
				} else {
					// MODO CREAR
					const created = await createAppointment({
						...values,
						dateTime: formattedDate as unknown as Date,
					});
					setAgendas((prev) => [created.appointment, ...prev]);
				}

				resetModal();
				setShowNotification(true);
			} catch (err) {
				console.error('Error al guardar agenda:', err);
			}
		},
	});
	const openEditModal = (agenda: Agenda) => {
		setEditingAgenda(agenda);
		setDateTime(new Date(agenda.dateTime));
		setShowModal(true);
		formik.setValues({
			name: agenda.name || '',
			gender: agenda.gender,
			service: agenda.service,
		});
	};
	const logout = () => {
		useAuthStore.getState().logout();
		navigate('/');
	};
	const inputClass = (touched: boolean, error?: string) =>
		`w-full max-w-[400px] px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${
			touched && error ? 'border-red-500' : 'border-gray-300'
		}`;

	const dateError = dateTouched && !dateTime;
	const hourError =
		hourTouched &&
		(!dateTime ||
			isNaN(dateTime.getHours()) ||
			dateTime.getHours() < 8 ||
			dateTime.getHours() > 17);

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#fef9f9] via-[#f2f2ff] to-[#d9e8ff] py-12 px-4 sm:px-6 lg:px-8">
			{showNotification && (
				<Notification
					message="Operación realizada exitosamente"
					onClose={() => setShowNotification(false)}
				/>
			)}

			<div className="max-w-7xl mx-auto">
				<div className="flex justify-between items-center mb-10">
					<h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-black via-gray-800 to-black text-transparent bg-clip-text">
						Mis Agendas
					</h1>
					<div className="flex gap-4 items-center">
						<button
							onClick={() => setShowModal(true)}
							className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-black to-gray-700 text-white rounded-lg shadow hover:brightness-110">
							<PlusCircleIcon className="w-5 h-5" />
							Agregar Agenda
						</button>
						<LogOut
							onClick={() => setConfirmLogout(true)}
							className="cursor-pointer"
						/>
					</div>
				</div>

				{loading ? (
					<div className="flex items-center justify-center h-[60vh]">
						<ScissorsIcon className="w-16 h-16 text-black animate-pulse" />
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
						{agendas.map((agenda) => (
							<div
								key={agenda.id}
								className="bg-gradient-to-br from-white via-gray-100 to-white rounded-2xl shadow-xl p-6 flex flex-col gap-4 border border-gray-200 hover:shadow-2xl transition relative">
								<button
									onClick={() => confirmDelete(agenda.id)}
									className="absolute top-3 right-3 p-2 rounded-full hover:bg-red-100 transition text-red-600">
									<Trash2Icon className="w-5 h-5" />
								</button>
								<button
									onClick={() => openEditModal(agenda)}
									className="absolute top-3 right-10 p-2 rounded-full hover:bg-yellow-100 transition text-yellow-600">
									<PencilIcon className="w-5 h-5" />
								</button>

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
						))}
					</div>
				)}
			</div>

			{/* Confirmación para eliminar */}
			<ConfirmModal
				isOpen={confirmDeleteOpen}
				title="¿Estás seguro de eliminar esta cita?"
				description="Esta acción no se puede deshacer."
				onCancel={() => setConfirmDeleteOpen(false)}
				onConfirm={handleConfirmedDelete}
				confirmText="Eliminar"
				cancelText="Cancelar"
			/>
			{/* Confirmación para cerrar sesión */}
			<ConfirmModal
				isOpen={confirmLogout}
				title="¿Estás seguro de cerrar sesión?"
				description="Esta acción te llevará a la página de inicio."
				onCancel={() => setConfirmLogout(false)}
				onConfirm={logout}
				confirmText="Eliminar"
				cancelText="Cancelar"
			/>
			{/* Modal para crear nueva agenda */}
			{showModal && (
				<div className="fixed inset-0 z-50 bg-black/10 backdrop-blur-sm flex justify-center items-center px-4">
					<div className="bg-white w-full max-w-lg rounded-2xl p-8 relative shadow-xl max-h-[95vh] overflow-y-auto">
						<button
							onClick={resetModal}
							className="absolute top-4 right-4 text-gray-500 hover:text-black">
							<XIcon className="w-5 h-5" />
						</button>
						<h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
							Agregar Nueva Agenda
						</h2>
						<form
							onSubmit={formik.handleSubmit}
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
										fromDate={new Date()}
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
										const [hours, minutes] = e.target.value
											.split(':')
											.map(Number);
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
										!dateTime
											? 'bg-gray-100 text-gray-400 cursor-not-allowed'
											: ''
									}`}>
									<option value="">Hora</option>
									{Array.from({ length: 10 }, (_, i) => i + 8).map((hour) => {
										const time = `${hour.toString().padStart(2, '0')}:00`;
										return (
											<option key={time} value={time}>
												{time}
											</option>
										);
									})}
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
								className={inputClass(formik.touched.name!, formik.errors.name)}
							/>

							{/* Género */}
							<select
								name="gender"
								value={formik.values.gender}
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								className={inputClass(
									formik.touched.gender!,
									formik.errors.gender
								)}>
								<option value="">Seleccionar género</option>
								<option value="masculino">Masculino</option>
								<option value="femenino">Femenino</option>
							</select>
							{formik.touched.gender && formik.errors.gender && (
								<p className="text-red-500 text-sm flex items-center gap-1">
									<AlertCircleIcon className="w-4 h-4" /> {formik.errors.gender}
								</p>
							)}
							<select
								name="service"
								value={formik.values.service}
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								className={inputClass(
									formik.touched.service!,
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
									<AlertCircleIcon className="w-4 h-4" />{' '}
									{formik.errors.service}
								</p>
							)}

							<button
								type="submit"
								className="w-full max-w-[400px] mt-4 py-2 bg-gradient-to-r from-black via-gray-800 to-gray-700 text-white font-semibold rounded-lg shadow hover:brightness-110">
								Agendar
							</button>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
