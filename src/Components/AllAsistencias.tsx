import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography, CircularProgress
} from '@mui/material';

interface Asistencia {
  usuario: string;
  DNI: string;
  fecha_inicio: string;
  fecha_fin: string | null;
}

export default function AllAsistencias() {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAsistencias = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No se encontró el token de autenticación.');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:2000/asistencias/todos', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setAsistencias(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al cargar asistencias');
      } finally {
        setLoading(false);
      }
    };

    fetchAsistencias();
  }, []);

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;
  if (error) return <Typography color="error" align="center" sx={{ mt: 4 }}>{error}</Typography>;

  return (
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      <Typography variant="h6" align="center" sx={{ p: 2 }}>
        Asistencias Registradas
      </Typography>

      {asistencias.length === 0 ? (
        <Typography align="center" sx={{ p: 2 }}>
          No hay registros de asistencias.
        </Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Usuario</strong></TableCell>
              <TableCell><strong>DNI</strong></TableCell>
              <TableCell><strong>Clock-in</strong></TableCell>
              <TableCell><strong>Clock-out</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {asistencias.map((asistencia, index) => (
              <TableRow key={index}>
                <TableCell>{asistencia.usuario}</TableCell>
                <TableCell>{asistencia.DNI}</TableCell>
                <TableCell>{new Date(asistencia.fecha_inicio).toLocaleString()}</TableCell>
                <TableCell>
                  {asistencia.fecha_fin
                    ? new Date(asistencia.fecha_fin).toLocaleString()
                    : '---'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </TableContainer>
  );
}
