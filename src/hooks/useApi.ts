// src/hooks/useApi.ts
import axios from 'axios';

const api = axios.create({
	baseURL: 'http://localhost:4000',
	headers: {
		'Content-Type': 'application/json',
	},
});

// Puedes extender esto según crezca tu app
import { useAuthStore } from '../store/useAuthStore';

export const useApi = () => {
	const setAuth = useAuthStore((state) => state.setAuth);

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

	return {
		login,
		register,
	};
};
