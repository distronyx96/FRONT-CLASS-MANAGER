import React, { useEffect, useState } from 'react';
import {
  Box, Typography, List, ListItem, ListItemText,
  CircularProgress, Alert, Button, Dialog, DialogTitle,
  DialogContent, Table, TableHead, TableRow, TableCell,
  TableBody, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

interface Clase {
  id: number;
  nombre: string;
  descripcion: string;
}

interface Falta {
  id: number;
  fecha: string;
  descripcion: string;
  clase_id?: number;
  clase_nombre?: string;
}

interface Props {
  userId: number;
  rol: 'profesor' | 'alumno' | 'admin';
}

export const MisClases: React.FC<Props> = ({ userId, rol }) => {
  const [clases, setClases] = useState<Clase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [faltasGlobal, setFaltasGlobal] = useState<Falta[]>([]);
  const [openFaltas, setOpenFaltas] = useState(false);

  useEffect(() => {
    const obtenerClases = async () => {
      try {
        if (rol !== 'alumno') {
          setError('Rol no válido para esta vista');
          setLoading(false);
          return;
        }

        const { data } = await axios.get(`http://localhost:2000/clases/alumno/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        setClases(Array.isArray(data) ? data : data.data);
      } catch (err) {
        setError('Error al obtener clases');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    obtenerClases();
  }, [userId, rol]);

  const handleVerFaltas = async () => {
    try {
      const res = await axios.get('http://localhost:2000/faltas', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: { alumno_id: userId },
      });
      setFaltasGlobal(res.data?.data || []);
      setOpenFaltas(true);
    } catch (err) {
      console.error('Error al cargar faltas globales del alumno:', err);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Mis Clases</Typography>
        <Button variant="outlined" onClick={handleVerFaltas}>Ver todas mis faltas</Button>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : clases.length === 0 ? (
        <Typography>No estás asignado a ninguna clase.</Typography>
      ) : (
        <List>
          {clases.map(clase => (
            <ListItem key={clase.id} divider>
              <ListItemText primary={clase.nombre} secondary={clase.descripcion} />
            </ListItem>
          ))}
        </List>
      )}

      {/* Modal de faltas */}
      <Dialog open={openFaltas} onClose={() => setOpenFaltas(false)} fullWidth maxWidth="md">
        <DialogTitle>
          Mis Faltas Registradas
          <IconButton onClick={() => setOpenFaltas(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {faltasGlobal.length === 0 ? (
            <Typography>No tienes faltas registradas.</Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Clase</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Motivo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {faltasGlobal.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>{f.clase_nombre || `Clase ID ${f.clase_id}`}</TableCell>
                    <TableCell>{new Date(f.fecha).toLocaleDateString()}</TableCell>
                    <TableCell>{f.descripcion}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};
