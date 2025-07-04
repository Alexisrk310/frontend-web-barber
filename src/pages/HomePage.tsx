'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { PlusCircleIcon, ScissorsIcon, LogOut, Sparkles } from 'lucide-react';
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
import type { Agenda } from '@/interfaces/appointments.Interface';

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
	const { user } = useAuthStore();

	// ✅ Ocultar automáticamente el toast si no es tipo 'info'
	useEffect(() => {
		if (toast && toast.type !== 'info') {
			const timeout = setTimeout(() => setToast(null), 3000);
			return () => clearTimeout(timeout);
		}
	}, [toast]);

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

			try {
				if (editingAgenda) {
					setToast({ message: 'Editando agenda...', type: 'info' });
					const updated = await updateOwnAppointment(editingAgenda.id, {
						...values,
						dateTime: dateTime!,
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
						dateTime: dateTime!,
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
		<div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
			{/* Efectos de fondo */}
			<div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
			<div className="fixed inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)] pointer-events-none" />

			{toast && (
				<Notification
					message={toast.message}
					type={toast.type}
					onClose={() => {
						if (toast.type !== 'info') setToast(null);
					}}
				/>
			)}

			<div className="max-w-7xl mx-auto relative z-10">
				{/* Header */}
				<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
					<div className="flex items-center gap-4">
						<div className="relative">
							<div className="w-16 h-16 bg-gradient-to-br from-white to-gray-300 rounded-full flex items-center justify-center shadow-2xl">
								<ScissorsIcon className="w-8 h-8 text-black" />
							</div>
							<div className="absolute -inset-2 bg-gradient-to-r from-white/20 to-transparent rounded-full blur-lg" />
						</div>
						<div>
							<h1 className="text-5xl lg:text-6xl font-black tracking-tight">
								<span className="bg-gradient-to-r text-white bg-clip-text">
									Mis Agendas
								</span>
							</h1>
							<p className="text-gray-400 text-lg mt-2 flex items-center gap-2">
								<Sparkles className="w-5 h-5" />
								Barbería Premium
							</p>
						</div>
					</div>

					<div className="flex flex-wrap gap-3 items-center">
						<button
							onClick={() => setShowModal(true)}
							className="bg-gradient-to-r from-white to-gray-200 text-black hover:from-gray-200 hover:to-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2">
							<PlusCircleIcon className="w-5 h-5" />
							Agregar Agenda
						</button>

						{user?.role === 'admin' && (
							<button
								onClick={() => navigate('/agendas/all')}
								className="border border-gray-600 text-white hover:bg-white/10 px-6 py-3 rounded-xl transition-all duration-300 bg-transparent">
								Ver Todas las Agendas
							</button>
						)}

						<button
							onClick={() => setConfirmLogout(true)}
							className="text-gray-400 hover:text-white hover:bg-red-500/20 p-3 rounded-xl transition-all duration-300">
							<LogOut className="w-5 h-5 text-red-500" />
						</button>
					</div>
				</div>

				{/* Contenido principal */}
				{loading ? (
					<div className="flex flex-col items-center justify-center h-[70vh]">
						<div className="relative">
							<div className="w-32 h-32 rounded-full bg-gradient-to-r from-gray-800 via-black to-gray-800 flex items-center justify-center border-2 border-gray-600 shadow-2xl animate-spin">
								<div className="w-24 h-24 rounded-full bg-gradient-to-r from-white via-gray-200 to-white flex items-center justify-center">
									<ScissorsIcon className="w-12 h-12 text-black animate-pulse" />
								</div>
							</div>
							<div className="absolute -inset-4 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full blur-xl animate-pulse" />
							<div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-4 bg-black/30 rounded-full blur-lg" />
						</div>

						<div className="mt-8 text-center">
							<h3 className="text-3xl font-bold text-white mb-2 animate-pulse">
								Cargando tu estilo...
							</h3>
							<p className="text-gray-400 text-lg italic">
								Barbería con clase y precisión
							</p>
							<div className="flex items-center justify-center gap-1 mt-4">
								{[...Array(3)].map((_, i) => (
									<div
										key={i}
										className="w-2 h-2 bg-white rounded-full animate-bounce"
										style={{ animationDelay: `${i * 0.2}s` }}
									/>
								))}
							</div>
						</div>
					</div>
				) : agendas.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
						{agendas.map((agenda) => (
							<AgendaCard
								key={agenda.id}
								agenda={agenda}
								onEdit={openEditModal}
								onDelete={confirmDelete}
							/>
						))}
					</div>
				) : (
					<div className="text-center py-16">
						<div className="w-24 h-24 bg-gradient-to-r from-gray-800 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
							<ScissorsIcon className="w-12 h-12 text-gray-400" />
						</div>
						<h3 className="text-2xl font-bold text-white mb-2">
							No hay citas programadas
						</h3>
						<p className="text-gray-400 mb-6">
							Comienza agregando tu primera cita
						</p>
						<button
							onClick={() => setShowModal(true)}
							className="bg-gradient-to-r from-white to-gray-200 text-black hover:from-gray-200 hover:to-white font-semibold px-6 py-3 rounded-xl">
							<PlusCircleIcon className="w-5 h-5 mr-2 inline" />
							Agregar Primera Cita
						</button>
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
				confirmText="Cerrar sesión"
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
