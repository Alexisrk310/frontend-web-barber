import HomePage from '@/pages/HomePage';
import RegisterPage from '@/pages/RegisterPage';
import SignInPage from '@/pages/SignInPage';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

function PublicRouter() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<SignInPage />} />
				<Route path="/register" element={<RegisterPage />} />
				<Route path="/inicio" element={<HomePage />} />
			</Routes>
		</BrowserRouter>
	);
}

export default PublicRouter;
