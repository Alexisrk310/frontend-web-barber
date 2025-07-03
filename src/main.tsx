import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<GoogleOAuthProvider clientId="705584095669-4g4euft9lij0ad603km3o2rmkr7ukpn2.apps.googleusercontent.com">
			<App />
		</GoogleOAuthProvider>
	</StrictMode>
);
