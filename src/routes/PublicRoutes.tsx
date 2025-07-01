import HomePage from '@/pages/HomePage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';


function PublicRouter() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<HomePage />} />
			</Routes>
		</BrowserRouter>
	);
}

export default PublicRouter;
