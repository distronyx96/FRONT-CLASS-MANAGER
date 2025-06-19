import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, Table, TableHead,
  TableRow, TableCell, TableBody, IconButton
} from '@mui/material';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';

export const ListaFaltasGlobal: React.FC<{ open: boolean, onClose: () => void }> = ({ open, onClose }) => {
  const [faltas, setFaltas] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (open && token) {
      axios.get('http://localhost:2000/faltas/detalladas', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => setFaltas(res.data))
        .catch(err => {
          console.error('Error al obtener faltas detalladas:', err);
          setError('No se pudieron cargar las faltas.');
        });
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Faltas Registradas
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Apellidos</TableCell>
                <TableCell>DNI</TableCell>
                <TableCell>Clase</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Motivo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {faltas.length > 0 ? (
                faltas.map(f => (
                  <TableRow key={f.id}>
                    <TableCell>{f.nombre}</TableCell>
                    <TableCell>{f.apellidos}</TableCell>
                    <TableCell>{f.DNI}</TableCell>
                    <TableCell>{f.clase}</TableCell>
                    <TableCell>{new Date(f.fecha).toLocaleDateString()}</TableCell>
                    <TableCell>{f.motivo}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No hay faltas registradas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
};
