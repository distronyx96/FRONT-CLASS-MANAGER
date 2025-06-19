// src/components/ClockButton.tsx
import { Button, Snackbar, Alert } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ClockButton() {
  const [estado, setEstado] = useState<'inactivo' | 'activo'>('inactivo');
  const [mensaje, setMensaje] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [rol, setRol] = useState<string | null>(null);

  useEffect(() => {
    const fetchEstadoYRol = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Obtener estado actual del fichaje
        const estadoRes = await axios.get('http://localhost:2000/asistencias/estado', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEstado(estadoRes.data.activo ? 'activo' : 'inactivo');

        // Decodificar JWT (sin librerías)
        const payloadBase64 = token.split('.')[1];
        const payload = JSON.parse(atob(payloadBase64));
        setRol(payload.rol);
      } catch (err) {
        console.error(err);
      }
    };

    fetchEstadoYRol();
  }, []);

  const handleClock = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const url = estado === 'inactivo'
        ? 'http://localhost:2000/asistencias/clock-in'
        : 'http://localhost:2000/asistencias/clock-out';

      const response = await axios.post(url, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.error) {
        setMensaje(response.data.error);
        setOpenSnackbar(true);
        return;
      }

      setEstado(estado === 'inactivo' ? 'activo' : 'inactivo');
      setMensaje(estado === 'inactivo'
        ? '¡Has fichado correctamente la entrada!'
        : '¡Has fichado correctamente la salida!');
      setOpenSnackbar(true);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al fichar';
      setMensaje(errorMessage);
      setOpenSnackbar(true);
    }
  };

  if (rol === 'admin') return null; // ocultar botón si es admin

  return (
    <>
      <Button
        variant="contained"
        onClick={handleClock}
        sx={{
          backgroundColor: estado === 'activo' ? 'red' : 'green',
          color: 'white',
          '&:hover': {
            backgroundColor: estado === 'activo' ? '#b71c1c' : '#2e7d32',
          },
          px: 4
        }}
      >
        {estado === 'activo' ? 'Clock Out' : 'Clock In'}
      </Button>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={5000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="info" sx={{ width: '100%' }}>
          {mensaje}
        </Alert>
      </Snackbar>
    </>
  );
}
