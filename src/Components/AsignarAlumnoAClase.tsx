import React, { useEffect, useState } from 'react';
import {
  Box, Button, Typography, MenuItem, Snackbar, Alert,
  Select, InputLabel, FormControl, Table, TableHead,
  TableRow, TableCell, TableBody, Paper, Container, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, TextField
} from '@mui/material';
import axios from 'axios';
import { ListaFaltasGlobal } from './ListaFaltasGlobal';

interface Persona {
  id: number;
  nombre: string;
  apellidos: string;
}

interface Clase {
  id: number;
  nombre: string;
}

interface AlumnoAsignado {
  user_id: number;
  nombre: string;
  apellidos: string;
  clase: string;
  clase_id: number;
}

export const AsignarAlumnoAClase: React.FC = () => {
  const [alumnos, setAlumnos] = useState<Persona[]>([]);
  const [clases, setClases] = useState<Clase[]>([]);
  const [alumnoId, setAlumnoId] = useState<string | null>(null);
  const [claseId, setClaseId] = useState('');
  const [asignados, setAsignados] = useState<AlumnoAsignado[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);
  const [verFaltasOpen, setVerFaltasOpen] = useState(false);
  const [errorFalta, setErrorFalta] = useState<string | null>(null);
  const [openErrorFalta, setOpenErrorFalta] = useState(false);


  const [filtroClaseId, setFiltroClaseId] = useState<string>('');
  const [filtroAlumnoId, setFiltroAlumnoId] = useState<string>('');
  const [faltas, setFaltas] = useState<{ [key: string]: number }>({});

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ userId: number; claseId: number } | null>(null);

  // Modal motivo falta
  const [modalOpen, setModalOpen] = useState(false);
  const [motivoFalta, setMotivoFalta] = useState('');
  const [alumnoFalta, setAlumnoFalta] = useState<{ user_id: number, clase_id: number } | null>(null);

  const token = localStorage.getItem('token');
  const hoy = new Date().toISOString().slice(0, 10);

  const fetchAlumnos = async () => {
    const res = await axios.get('http://localhost:2000/alumno-clase/', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setAlumnos(res.data);
  };

  const fetchClases = async () => {
    const res = await axios.get('http://localhost:2000/clases', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setClases(res.data);
  };

  const fetchTodosAsignados = async () => {
    const res = await axios.get('http://localhost:2000/alumno-clase-todos', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setAsignados(res.data);
  };

  const fetchFaltas = async () => {
    const res = await axios.get('http://localhost:2000/faltas', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const map: { [key: string]: number } = {};
    res.data?.data?.forEach((falta: any) => {
      const key = `${falta.usuario_id_alumno}-${falta.clase_id}-${falta.fecha}`;
      map[key] = falta.id;
    });
    setFaltas(map);
  };

  useEffect(() => {
    const init = async () => {
      await fetchAlumnos();
      await fetchClases();
      await fetchTodosAsignados();
      await fetchFaltas();
    };
    init();
  }, []);

  const handleAsignar = async () => {
    try {
      const res = await axios.post('http://localhost:2000/alumno-clase', {
        alumno_id: Number(alumnoId),
        clase_id: Number(claseId),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const nuevoAlumno: AlumnoAsignado = {
        user_id: res.data.user_id,
        nombre: res.data.nombre,
        apellidos: res.data.apellidos,
        clase: res.data.clase,
        clase_id: Number(claseId),
      };

      setAsignados(prev => [...prev, nuevoAlumno]);
      setMensaje('Alumno asignado correctamente.');
      setError(false);
      setAlumnoId(null);
      setClaseId('');
    } catch (err: any) {
      setMensaje(err.response?.data?.error || 'Error al asignar clase.');
      setError(true);
    } finally {
      setOpen(true);
    }
  };

  const handleEliminar = async (userId: number, claseId: number) => {
    await axios.delete(`http://localhost:2000/alumno-clase/`, {
      data: { user_id: userId, clase_id: claseId },
      headers: { Authorization: `Bearer ${token}` },
    });

    setAsignados(prev => prev.filter(a => !(a.user_id === userId && a.clase_id === claseId)));
    setMensaje('Alumno eliminado de la clase correctamente.');
    setError(false);
    setOpen(true);
  };

  const confirmarEliminacion = () => {
    if (pendingDelete) {
      handleEliminar(pendingDelete.userId, pendingDelete.claseId);
      setPendingDelete(null);
    }
    setConfirmOpen(false);
  };

  const abrirModalFalta = (user_id: number, clase_id: number) => {
    setAlumnoFalta({ user_id, clase_id });
    setMotivoFalta('');
    setModalOpen(true);
  };

  const registrarFalta = async () => {
    if (!alumnoFalta) return;

    try {
      const res = await axios.post('http://localhost:2000/faltas', {
        alumno_id: alumnoFalta.user_id,
        clase_id: alumnoFalta.clase_id,
        fecha: hoy,
        motivo: motivoFalta || 'Falta registrada manualmente',
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const key = `${alumnoFalta.user_id}-${alumnoFalta.clase_id}-${hoy}`;
      const newId = res.data?.data?.insertId || Date.now();
      setFaltas({ ...faltas, [key]: newId });

    } catch (error: any) {
      setErrorFalta(error.response?.data?.error || 'Error al registrar la falta');
      setOpenErrorFalta(true);

    } finally {
      setModalOpen(false);
    }
  };

  const asignadosFiltrados = asignados.filter((a) => {
    const coincideClase = !filtroClaseId || a.clase_id.toString() === filtroClaseId;
    const coincideAlumno = !filtroAlumnoId || a.user_id.toString() === filtroAlumnoId;
    return coincideClase && coincideAlumno;
  });

  return (
    <Container>
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Asignar Alumno a Clase</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <FormControl fullWidth>
            <InputLabel>Alumno</InputLabel>
            <Select value={alumnoId} label="Alumno" onChange={(e) => setAlumnoId(e.target.value)}>
              {alumnos.map(a => (
                <MenuItem key={a.id} value={a.id}>{a.nombre} {a.apellidos}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Clase</InputLabel>
            <Select value={claseId} label="Clase" onChange={(e) => setClaseId(e.target.value)}>
              {clases.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="contained" color="primary" onClick={handleAsignar} disabled={!alumnoId || !claseId}>
            Asignar
          </Button>
        </Box>

        <Snackbar open={open} autoHideDuration={3000} onClose={() => setOpen(false)}>
          <Alert severity={error ? 'error' : 'success'}>{mensaje}</Alert>
        </Snackbar>
      </Paper>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>Alumnos Asignados a Clases</Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Filtrar por Clase</InputLabel>
            <Select value={filtroClaseId} onChange={(e) => setFiltroClaseId(e.target.value)}>
              <MenuItem value="">Todas</MenuItem>
              {clases.map(c => <MenuItem key={c.id} value={c.id.toString()}>{c.nombre}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Filtrar por Alumno</InputLabel>
            <Select value={filtroAlumnoId} onChange={(e) => setFiltroAlumnoId(e.target.value)}>
              <MenuItem value="">Todos</MenuItem>
              {alumnos.map(a => <MenuItem key={a.id} value={a.id.toString()}>{a.nombre} {a.apellidos}</MenuItem>)}
            </Select>
          </FormControl>

          <Button variant="outlined" onClick={() => setVerFaltasOpen(true)}>Ver Faltas</Button>
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Alumno</TableCell>
              <TableCell>Clase</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {asignadosFiltrados.map(a => {
              const key = `${a.user_id}-${a.clase_id}-${hoy}`;
              const faltaId = faltas[key];

              return (
                <TableRow key={key}>
                  <TableCell>{a.nombre} {a.apellidos}</TableCell>
                  <TableCell>{a.clase}</TableCell>
                  <TableCell>
                    <Button color="error" variant="outlined" onClick={() => {
                      setPendingDelete({ userId: a.user_id, claseId: a.clase_id });
                      setConfirmOpen(true);
                    }}>
                      Eliminar
                    </Button>
                    <Button
                      variant="contained"
                      color={faltaId ? 'success' : 'warning'}
                      sx={{ ml: 1 }}
                      onClick={() => {
                        if (faltaId) {
                          axios.delete(`http://localhost:2000/faltas/${faltaId}`, {
                            headers: { Authorization: `Bearer ${token}` }
                          }).then(() => {
                            const updated = { ...faltas };
                            delete updated[key];
                            setFaltas(updated);
                          }).catch(() => {
                            alert('Error al eliminar la falta');
                          });
                        } else {
                          abrirModalFalta(a.user_id, a.clase_id);
                        }
                      }}
                    >
                      {faltaId ? 'Quitar Falta' : 'Poner Falta'}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>¿Estás seguro de que deseas eliminar este alumno de la clase?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button onClick={confirmarEliminacion} color="error" variant="contained">Eliminar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>Motivo de la Falta</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="Motivo"
            type="text"
            value={motivoFalta}
            onChange={(e) => setMotivoFalta(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button onClick={registrarFalta} variant="contained">Registrar Falta</Button>
        </DialogActions>
      </Dialog>

      <ListaFaltasGlobal open={verFaltasOpen} onClose={() => setVerFaltasOpen(false)} />
      <Snackbar open={openErrorFalta} autoHideDuration={4000} onClose={() => setOpenErrorFalta(false)}>
        <Alert severity="error" sx={{ width: '100%' }} onClose={() => setOpenErrorFalta(false)}>
          {errorFalta}
        </Alert>
      </Snackbar>

    </Container>
  );
};
