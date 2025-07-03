import HomeAdminPage from '@/pages/HomeAdminPage';
import HomePage from '@/pages/HomePage';
import RegisterPage from '@/pages/RegisterPage';
import SignInPage from '@/pages/SignInPage';
import { useAuthStore } from '@/store/useAuthStore';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

function PublicRouter() {
	const { user } = useAuthStore();
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<SignInPage />} />
				<Route path="/register" element={<RegisterPage />} />
				<Route path="/inicio" element={<HomePage />} />
				{user?.role === 'admin' && (
					<Route path="/agendas/all" element={<HomeAdminPage />} />
				)}
			</Routes>
		</BrowserRouter>
	);
}

export default PublicRouter;
