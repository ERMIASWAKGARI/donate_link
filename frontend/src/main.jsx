import { GoogleOAuthProvider } from '@react-oauth/google';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { ChatProvider } from './context/ChatContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { UserProvider } from './context/UserContext';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <UserProvider>
        <SocketProvider>
          <ChatProvider>
            <GoogleOAuthProvider clientId="1021431617656-ngngp6r2q4q2b53f12vio2pjq85hjsgj.apps.googleusercontent.com">
              <ErrorBoundary>
                <App />
              </ErrorBoundary>
            </GoogleOAuthProvider>{' '}
          </ChatProvider>
        </SocketProvider>
      </UserProvider>
    </Router>
  </StrictMode>
);
