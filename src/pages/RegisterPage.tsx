import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import Notification from '@/components/Notification';

interface RegisterFormValues {
	name: string;
	email: string;
	password: string;
	gender: string;
}

export default function RegisterPage(): React.JSX.Element {
	const navigate = useNavigate();
	const { register } = useApi();
	const [toast, setToast] = useState<{
		message: string;
		type: 'success' | 'error' | 'info' | 'warning';
	} | null>(null);

	// Ocultar automáticamente el toast solo cuando no sea tipo 'info'
	useEffect(() => {
		if (toast && toast.type !== 'info') {
			const timeout = setTimeout(() => setToast(null), 3000);
			return () => clearTimeout(timeout);
		}
	}, [toast]);

	const formik = useFormik<RegisterFormValues>({
		initialValues: {
			name: '',
			email: '',
			password: '',
			gender: '',
		},
		validationSchema: Yup.object({
			name: Yup.string().required('Nombre requerido'),
			email: Yup.string().email('Email inválido').required('Email requerido'),
			password: Yup.string()
				.min(6, 'Mínimo 6 caracteres')
				.required('Contraseña requerida'),
			gender: Yup.string().required('Selecciona el género'),
		}),
		onSubmit: async (values, { resetForm }) => {
			setToast({ message: 'Cargando...', type: 'info' });

			try {
				await register(values);
				setToast({ message: 'Registro exitoso', type: 'success' });

				setTimeout(() => {
					navigate('/');
				}, 1500);
			} catch (error: any) {
				const backendMsg =
					error.response?.data?.msg || 'Error al registrar usuario';
				setToast({ message: backendMsg, type: 'error' });
			} finally {
				resetForm();
			}
		},
	});

	const bg = 'https://thebarbeer.co/wp-content/uploads/2018/05/barberia_06.jpg';

	return (
		<>
			{toast && (
				<Notification
					message={toast.message}
					type={toast.type}
					onClose={() => {
						if (toast.type !== 'info') setToast(null);
					}}
				/>
			)}

			<div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
				<div
					className="hidden lg:block bg-cover bg-center"
					style={{ backgroundImage: `url(${bg})` }}></div>

				<div className="flex flex-col items-center justify-center bg-gradient-to-br from-white via-neutral-100 to-gray-200 px-6 py-12">
					<form
						onSubmit={formik.handleSubmit}
						className="w-full max-w-xl space-y-8">
						<div className="text-center">
							<h2 className="text-5xl font-black bg-gradient-to-r from-black to-gray-700 text-transparent bg-clip-text">
								Registro
							</h2>
							<p className="text-gray-600 mt-2 text-base">
								Sé parte de la experiencia de nuestra barbería profesional
							</p>
						</div>

						<div className="grid gap-6">
							{/* Nombre */}
							<div>
								<label className="block text-sm font-medium text-gray-800">
									Nombre
								</label>
								<input
									type="text"
									name="name"
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.name}
									className="mt-1 block w-full px-5 py-3 rounded-lg bg-white shadow-inner border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
								/>
								{formik.touched.name && formik.errors.name && (
									<p className="text-red-500 text-xs mt-1">
										{formik.errors.name}
									</p>
								)}
							</div>

							{/* Email */}
							<div>
								<label className="block text-sm font-medium text-gray-800">
									Correo electrónico
								</label>
								<input
									type="email"
									name="email"
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.email}
									className="mt-1 block w-full px-5 py-3 rounded-lg bg-white shadow-inner border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
								/>
								{formik.touched.email && formik.errors.email && (
									<p className="text-red-500 text-xs mt-1">
										{formik.errors.email}
									</p>
								)}
							</div>

							{/* Contraseña */}
							<div>
								<label className="block text-sm font-medium text-gray-800">
									Contraseña
								</label>
								<input
									type="password"
									name="password"
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.password}
									className="mt-1 block w-full px-5 py-3 rounded-lg bg-white shadow-inner border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
								/>
								{formik.touched.password && formik.errors.password && (
									<p className="text-red-500 text-xs mt-1">
										{formik.errors.password}
									</p>
								)}
							</div>

							{/* Género */}
							<div>
								<label className="block text-sm font-medium text-gray-800">
									Género
								</label>
								<select
									name="gender"
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.gender}
									className="mt-1 block w-full px-5 py-3 rounded-lg bg-white shadow-inner border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black">
									<option value="">Selecciona una opción</option>
									<option value="Hombre">Hombre</option>
									<option value="Mujer">Mujer</option>
								</select>
								{formik.touched.gender && formik.errors.gender && (
									<p className="text-red-500 text-xs mt-1">
										{formik.errors.gender}
									</p>
								)}
							</div>
						</div>

						{/* Botón de registro */}
						<button
							type="submit"
							className="w-full py-3 bg-gradient-to-r from-black via-neutral-800 to-gray-700 text-white font-semibold rounded-lg shadow-lg hover:brightness-110 transition duration-300">
							Crear cuenta
						</button>

						{/* Link a login */}
						<div className="text-center">
							<button
								type="button"
								onClick={() => navigate('/')}
								className="mt-4 inline-block text-sm text-gray-600 hover:underline hover:text-black">
								¿Ya tienes una cuenta? Inicia sesión
							</button>
						</div>
					</form>
				</div>
			</div>
		</>
	);
}
