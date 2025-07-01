import { useAuthStore } from '@/store/useAuthStore';

const HomePage = () => {
	const user = useAuthStore((state) => state.user);
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			<div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
				<h1 className="text-2xl font-bold mb-4">
					Bienvenido, {user?.name || 'Usuario'}
				</h1>
				<p className="text-gray-600">
					Esta es la página de inicio de tu aplicación.
				</p>
				<p className="text-gray-600 mt-2">
					Tu rol: {user?.role || 'No asignado'}
				</p>
			</div>
		</div>
	);
};

export default HomePage;
