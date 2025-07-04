'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import {
	ScissorsIcon,
	LogOut,
	ArrowLeft,
	Calendar,
	Clock,
	User,
} from 'lucide-react';
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

export default function HomeAdminPage(): React.JSX.Element {
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
	const [stats, setStats] = useState<{
		todayAppointments: number;
		weekAppointments: number;
		activeClientsCount: number;
	} | null>(null);

	const {
		getAllAppointments,
		adminUpdateAppointment,
		adminDeleteAppointment,
		getAppointmentStats,
	} = useApi();

	// ✅ Cierra automáticamente el toast si no es 'info'
	useEffect(() => {
		if (toast && toast.type !== 'info') {
			const timeout = setTimeout(() => setToast(null), 3000);
			return () => clearTimeout(timeout);
		}
	}, [toast]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const data = await getAllAppointments();
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

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [data, statsData] = await Promise.all([
					getAllAppointments(),
					getAppointmentStats(),
				]);
				setAgendas(Array.isArray(data.appointments) ? data.appointments : []);
				setStats(statsData);
			} catch (err) {
				setToast({
					message: 'Error al cargar agendas o estadísticas',
					type: 'error',
				});
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	const handleConfirmedDelete = async () => {
		if (selectedIdToDelete !== null) {
			setToast({ message: 'Eliminando...', type: 'info' });
			try {
				const res = await adminDeleteAppointment(selectedIdToDelete);
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
			status: '',
		},
		validationSchema: Yup.object({
			gender: Yup.string().required('Género requerido'),
			service: Yup.string().required('Servicio requerido'),
			status: Yup.string().required('Estado requerido'),
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

			if (!isValidDate || !isValidHour) return;

			try {
				if (editingAgenda) {
					setToast({ message: 'Editando agenda...', type: 'info' });
					const updated = await adminUpdateAppointment(editingAgenda.id, {
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
					resetModal();
				}
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
			status: agenda.status,
		});
	};

	const logout = () => {
		useAuthStore.getState().logout();
		navigate('/');
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
			{toast && (
				<Notification
					message={toast.message}
					type={toast.type}
					onClose={() => {
						if (toast.type !== 'info') setToast(null);
					}}
				/>
			)}
			{/* Efectos de fondo */}
			<div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
			<div className="fixed inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)] pointer-events-none" />
			<div className="max-w-7xl mx-auto">
				<div className="flex justify-between items-center mb-10">
					<div className="flex items-center gap-4">
						<div className="w-16 h-16 bg-gradient-to-br from-white to-gray-300 rounded-full flex items-center justify-center shadow-xl">
							<ScissorsIcon className="w-8 h-8 text-black" />
						</div>
						<h1 className="text-5xl font-extrabold tracking-tight text-white bg-clip-text">
							Panel Admin - Agendas
						</h1>
					</div>

					<div className="flex items-center gap-4">
						<div
							className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-gray-800"
							onClick={() => navigate('/inicio')}>
							<ArrowLeft className="w-5 h-5" />
							<span>Regresar</span>
						</div>
						<button
							onClick={() => setConfirmLogout(true)}
							className="text-gray-400 hover:text-white hover:bg-red-500/20 p-3 rounded-xl transition-all duration-300">
							<LogOut className="w-5 h-5 text-red-500" />
						</button>
					</div>
				</div>

				{stats && (
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
						<div className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-xl shadow-xl p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-gray-400 text-sm">Citas de hoy</p>
									<h2 className="text-3xl font-bold text-white">
										{stats.todayAppointments}
									</h2>
								</div>
								<Calendar className="w-8 h-8 text-gray-500" />
							</div>
						</div>
						<div className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-xl shadow-xl p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-gray-400 text-sm">Citas de la semana</p>
									<h2 className="text-3xl font-bold text-white">
										{stats.weekAppointments}
									</h2>
								</div>
								<Clock className="w-8 h-8 text-gray-500" />
							</div>
						</div>
						<div className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-xl shadow-xl p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-gray-400 text-sm">Clientes activos</p>
									<h2 className="text-3xl font-bold text-white">
										{stats.activeClientsCount}
									</h2>
								</div>
								<User className="w-8 h-8 text-gray-500" />
							</div>
						</div>
					</div>
				)}

				{loading ? (
					<div className="flex flex-col items-center justify-center h-[80vh]">
						<div className="relative flex items-center justify-center">
							<div className="w-24 h-24 rounded-full bg-gradient-to-br from-white to-gray-400 shadow-xl flex items-center justify-center border border-gray-300 animate-bounce">
								<ScissorsIcon className="w-10 h-10 text-black" />
							</div>
							<div className="absolute bottom-0 w-20 h-2 bg-black/10 rounded-full blur-sm animate-pulse" />
						</div>
						<p className="mt-6 text-2xl font-semibold text-white tracking-wide animate-pulse">
							Cargando agendas...
						</p>
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
