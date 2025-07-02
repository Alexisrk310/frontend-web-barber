// src/hooks/useApi.ts
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
const api = axios.create({
	baseURL: 'http://localhost:4000',
	headers: {
		'Content-Type': 'application/json',
	},
});

export const useApi = () => {
	const token = useAuthStore.getState().token;
	const setAuth = useAuthStore((state) => state.setAuth);
	console.log('Token desde useApi:', token);
	const login = async (email: string, password: string) => {
		const response = await api.post('/auth/login', { email, password });

		// Guardar en la store de Zustand
		setAuth(response.data.user, response.data.token);

		return response.data;
	};

	const register = async (data: {
		name: string;
		email: string;
		password: string;
		gender: string;
	}) => {
		const response = await api.post('/auth/register', data);
		return response.data;
	};
	const getAppointments = async () => {
		const response = await api.get(
			'/api/appointments',

			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		return response.data;
	};

	const createAppointment = async (data: {
		name: string;
		gender: string;
		service: string;
		dateTime: Date;
	}) => {
		const res = await api.post(
			'/api/appointments',
			{ ...data },
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);
		console.log('Respuesta de crear cita:', res);

		return res.data;
	};
	const updateOwnAppointment = async (
		id: number,
		data: {
			name: string;
			gender: string;
			service: string;
			dateTime: Date;
		}
	) => {
		const response = await api.put(
			`/api/my/${id}`,
			{ ...data },
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);
		return response.data;
	};

	const deleteOwnAppointment = async (id: number) => {
		const token = useAuthStore.getState().token;
		console.log(id);

		const response = await api.delete(`/api/my/${id}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		return response.data;
	};
	const adminUpdateAppointment = async (
		id: number,
		data: {
			name: string;
			gender: string;
			service: string;
			dateTime: Date;
			status: string;
		}
	) => {
		const response = await api.put(
			`/api/${id}`,
			{ ...data },
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);
		return response.data;
	};

	return {
		login,
		register,
		createAppointment,
		deleteOwnAppointment,
		getAppointments,
		updateOwnAppointment,
		adminUpdateAppointment,
	};
};
