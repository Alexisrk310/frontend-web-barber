import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { useAuthStore } from '@/store/useAuthStore';
import Notification from '@/components/Notification';
import { GoogleLogin } from '@react-oauth/google';

interface SignInFormValues {
	email: string;
	password: string;
}

export default function SignInPage(): React.JSX.Element {
	const navigate = useNavigate();
	const { login, loginWithGoogle } = useApi();
	const [toast, setToast] = useState<{
		message: string;
		type: 'success' | 'error' | 'info' | 'warning';
	} | null>(null);

	const formik = useFormik<SignInFormValues>({
		initialValues: {
			email: '',
			password: '',
		},
		validationSchema: Yup.object({
			email: Yup.string().email('Email inválido').required('Email requerido'),
			password: Yup.string()
				.min(6, 'Mínimo 6 caracteres')
				.required('Contraseña requerida'),
		}),
		onSubmit: async (values, { resetForm }) => {
			// Primero mostramos "Cargando..."
			setToast({ message: 'Cargando...', type: 'info' });

			try {
				await login(values.email, values.password);

				// Cambiamos el toast a success (verde)
				setToast({ message: 'Inicio de sesión exitoso', type: 'success' });

				// Esperamos un poco antes de redirigir
				setTimeout(() => {
					navigate('/inicio');
				}, 1500);
			} catch (error: any) {
				const backendMsg =
					error.response?.data?.msg || 'Error al iniciar sesión';
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
					onClose={() => setToast(null)}
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
								Inicia sesión
							</h2>
							<p className="text-gray-600 mt-2 text-base">
								Sé parte de la experiencia de nuestra barbería profesional
							</p>
						</div>

						<div className="grid gap-6">
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
						</div>

						<button
							type="submit"
							className="w-full py-3 bg-gradient-to-r from-black via-neutral-800 to-gray-700 text-white font-semibold rounded-lg shadow-lg hover:brightness-110 transition duration-300">
							Entrar
						</button>
						<GoogleLogin
							onSuccess={async (credentialResponse) => {
								if (!credentialResponse.credential) return;

								try {
									await loginWithGoogle(credentialResponse.credential);
									setToast({
										message: 'Inicio de sesión con Google exitoso',
										type: 'success',
									});
									setTimeout(() => navigate('/inicio'), 1500);
								} catch (error: any) {
									setToast({
										message:
											error?.response?.data?.msg ||
											'Error al iniciar sesión con Google',
										type: 'error',
									});
								}
							}}
							onError={() => {
								setToast({
									message: 'Error al iniciar sesión con Google',
									type: 'error',
								});
							}}
						/>

						<div className="text-center">
							<button
								type="button"
								onClick={() => navigate('/register')}
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
