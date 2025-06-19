// src/pages/Fichaje.tsx
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import AllAsistencias from '../Components/AllAsistencias';
import FichajePersonal from './FichajePersonal';

interface TokenData {
  rol: string;
}

export default function Fichaje() {
  const [rol, setRol] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setRol(null);
      return;
    }

    try {
      const decoded = jwtDecode<TokenData>(token);
      setRol(decoded.rol);
    } catch {
      setRol(null);
    }
  }, []);

  if (!rol) {
    return <p>No autorizado</p>;
  }

  return rol === 'admin' ? <AllAsistencias /> : <FichajePersonal />;
}
