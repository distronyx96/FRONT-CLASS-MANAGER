// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext'; 

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider> {/* envuelve la app */}
      <App />
    </AuthProvider>
  </StrictMode>
);
