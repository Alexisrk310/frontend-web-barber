import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { PlusCircleIcon, ScissorsIcon, LogOut } from 'lucide-react';
import 'react-day-picker/dist/style.css';
import { useApi } from '../hooks/useApi';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import ConfirmModal from '@/components/ConfirmModal';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import Notification from '@/components/Notification';
import AgendaModal from '@/components/AgendaModal';
import AgendaCard from '@/components/AgendaCard';
import { Agenda } from '@/interfaces/appointments.Interface';

export default function AgendasPage(): React.JSX.Element {
	const [agendas, setAgendas] = useState<Agenda[]>([]);
	const [showModal, setShowModal] = useState(false);
	const [dateTime, setDateTime] = useState<Date | null>(null);
	const [dateTouched, setDateTouched] = useState(false);
	const [hourTouched, setHourTouched] = useState(false);
	const [loading, setLoading] = useState(true);
	const [toast, setToast] = useState<{
		message: string;
		type: 'success' | 'error' | 'info';
	} | null>(null);
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
				setToast({ message: 'Error al cargar agendas', type: 'error' });
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
			setToast({ message: 'Eliminando...', type: 'info' });
			try {
				const res = await deleteOwnAppointment(selectedIdToDelete);
				setAgendas((prev) =>
					prev.filter((agenda) => agenda.id !== selectedIdToDelete)
				);
				setToast({
					message: res?.message || 'Agenda eliminada',
					type: 'success',
				});
			} catch (err: any) {
				setToast({
					message: err.response?.data?.message || 'Error al eliminar agenda',
					type: 'error',
				});
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

			const formattedDate = format(dateTime, 'dd/MM/yyyy HH:mm');

			try {
				if (editingAgenda) {
					setToast({ message: 'Editando agenda...', type: 'info' });
					const updated = await updateOwnAppointment(editingAgenda.id, {
						...values,
						dateTime: formattedDate as unknown as Date,
					});
					setAgendas((prev) =>
						prev.map((item) =>
							item.id === editingAgenda.id ? updated.appointment : item
						)
					);
					setToast({
						message: updated?.message || 'Agenda actualizada',
						type: 'success',
					});
				} else {
					setToast({ message: 'Creando agenda...', type: 'info' });
					const created = await createAppointment({
						...values,
						dateTime: formattedDate as unknown as Date,
					});
					setAgendas((prev) => [created.appointment, ...prev]);
					setToast({
						message: created?.message || 'Agenda creada con éxito',
						type: 'success',
					});
				}
				resetModal();
			} catch (err: any) {
				setToast({
					message: err.response?.data?.message || 'Error al guardar agenda',
					type: 'error',
				});
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

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#fef9f9] via-[#f2f2ff] to-[#d9e8ff] py-12 px-4 sm:px-6 lg:px-8">
			{toast && (
				<Notification
					message={toast.message}
					onClose={() => setToast(null)}
					type={toast.type}
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
					<div className="flex flex-col items-center justify-center h-[80vh]">
						<div className="relative flex items-center justify-center">
							<div className="w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center border border-gray-300 animate-bounce">
								<ScissorsIcon className="w-10 h-10 text-black" />
							</div>
							<div className="absolute bottom-0 w-20 h-2 bg-black/10 rounded-full blur-sm animate-pulse" />
						</div>
						<p className="mt-6 text-2xl font-semibold text-gray-700 tracking-wide animate-pulse">
							Cargando tu estilo...
						</p>
						<span className="mt-2 text-sm text-gray-500 italic">
							Barbería con clase y precisión
						</span>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
						{agendas.map((agenda) => (
							<AgendaCard
								key={agenda.id}
								agenda={agenda}
								onEdit={openEditModal}
								onDelete={confirmDelete}
							/>
						))}
					</div>
				)}
			</div>

			<ConfirmModal
				isOpen={confirmDeleteOpen}
				title="¿Estás seguro de eliminar esta cita?"
				description="Esta acción no se puede deshacer."
				onCancel={() => setConfirmDeleteOpen(false)}
				onConfirm={handleConfirmedDelete}
				confirmText="Eliminar"
				cancelText="Cancelar"
			/>

			<ConfirmModal
				isOpen={confirmLogout}
				title="¿Estás seguro de cerrar sesión?"
				description="Esta acción te llevará a la página de inicio."
				onCancel={() => setConfirmLogout(false)}
				onConfirm={logout}
				confirmText="Eliminar"
				cancelText="Cancelar"
			/>

			<AgendaModal
				isOpen={showModal}
				onClose={resetModal}
				onSubmit={formik.handleSubmit}
				initialData={
					editingAgenda
						? {
								name: editingAgenda.name,
								gender: editingAgenda.gender,
								service: editingAgenda.service,
								dateTime: new Date(editingAgenda.dateTime),
						  }
						: undefined
				}
				dateError={dateTouched && !dateTime}
				hourError={
					hourTouched &&
					(!dateTime ||
						isNaN(dateTime.getHours()) ||
						dateTime.getHours() < 8 ||
						dateTime.getHours() > 17)
				}
				dateTime={dateTime}
				setDateTime={setDateTime}
				setDateTouched={setDateTouched}
				setHourTouched={setHourTouched}
				formik={formik}
			/>
		</div>
	);
}
