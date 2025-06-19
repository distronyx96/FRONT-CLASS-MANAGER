import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Paper, Button, Table, TableHead,
  TableRow, TableCell, TableBody, TextField, MenuItem, Select,
  InputLabel, FormControl, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Tabs, Tab, Box
} from '@mui/material';
import axios from 'axios';
import { AsignarAlumnoAClase } from '../Components/AsignarAlumnoAClase';
import { MisClases } from '../Components/MisClases';
import { useAuth } from '../context/AuthContext';
import { JSX } from 'react/jsx-runtime';

interface Clase {
  id: number;
  nombre: string;
  descripcion: string;
  profesor_id: number;
}

interface Profesor {
  id: number;
  nombre: string;
  apellidos: string;
}

const Classes: React.FC = () => {
  const { user } = useAuth();
  const [tabIndex, setTabIndex] = useState(0);
  const [clases, setClases] = useState<Clase[]>([]);
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [creando, setCreando] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '', profesor_id: '' });
  const [claseSeleccionadaId, setClaseSeleccionadaId] = useState<number | null>(null);
  const [mostrarFaltasId, setMostrarFaltasId] = useState<number | null>(null);
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroProfesor, setFiltroProfesor] = useState('');
  const [claseAEliminar, setClaseAEliminar] = useState<Clase | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const token = localStorage.getItem('token');

  const fetchClases = async () => {
    try {
      const res = await axios.get('http://localhost:2000/clases', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 200) setClases(res.data);
    } catch (error) {
      console.error('Error al cargar clases', error);
    }
  };

  const fetchProfesores = async () => {
    try {
      const res = await axios.get('http://localhost:2000/profesores', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 200) setProfesores(res.data);
    } catch (error) {
      console.error('Error al cargar profesores', error);
    }
  };

  useEffect(() => {
    fetchClases();
    fetchProfesores();
  }, []);

  const obtenerNombreProfesor = (id: number) => {
    const profesor = profesores.find((p) => p.id === id);
    return profesor ? `${profesor.nombre} ${profesor.apellidos}` : 'No asignado';
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCrear = () => {
    setFormData({ nombre: '', descripcion: '', profesor_id: '' });
    setEditandoId(null);
    setCreando(true);
  };

  const handleEditar = (clase: Clase) => {
    setFormData({
      nombre: clase.nombre,
      descripcion: clase.descripcion,
      profesor_id: String(clase.profesor_id),
    });
    setEditandoId(clase.id);
    setCreando(false);
  };

  const handleCancelar = () => {
    setFormData({ nombre: '', descripcion: '', profesor_id: '' });
    setEditandoId(null);
    setCreando(false);
  };

  const handleGuardar = async () => {
    try {
      const payload = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        profesor_id: Number(formData.profesor_id),
      };

      if (editandoId !== null) {
        await axios.put(`http://localhost:2000/clases/${editandoId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post('http://localhost:2000/clases', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      fetchClases();
      handleCancelar();
    } catch (error) {
      console.error('Error al guardar clase', error);
    }
  };

  const confirmarEliminacion = (clase: Clase) => {
    setClaseAEliminar(clase);
    setOpenDialog(true);
  };

  const cancelarEliminacion = () => {
    setClaseAEliminar(null);
    setOpenDialog(false);
  };

  const eliminarClaseConfirmada = async () => {
    if (!claseAEliminar) return;
    try {
      await axios.delete(`http://localhost:2000/clases/${claseAEliminar.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchClases();
      handleCancelar();
    } catch (error) {
      console.error('Error al eliminar clase', error);
    } finally {
      setOpenDialog(false);
      setClaseAEliminar(null);
    }
  };

  const tabs: { label: string; content: JSX.Element }[] = [];

  if (user?.rol === 'admin' || user?.rol === 'profesor') {
    tabs.push({
      label: 'Crear Clases',
      content: (
        <Paper sx={{ p: 4, mt: 4 }}>
          <Typography variant="h4" gutterBottom>Gestión de Clases</Typography>
          <Button variant="contained" onClick={handleCrear} disabled={creando || editandoId !== null}>
            Nueva Clase
          </Button>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filtrar por clase</InputLabel>
              <Select value={filtroNombre} label="Filtrar por clase" onChange={(e) => setFiltroNombre(e.target.value)}>
                <MenuItem value="">Todas</MenuItem>
                {[...new Set(clases.map(c => c.nombre))].map((nombre, i) => (
                  <MenuItem key={i} value={nombre}>{nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filtrar por profesor</InputLabel>
              <Select value={filtroProfesor} label="Filtrar por profesor" onChange={(e) => setFiltroProfesor(e.target.value)}>
                <MenuItem value="">Todos</MenuItem>
                {profesores.map(p => (
                  <MenuItem key={p.id} value={String(p.id)}>{p.nombre} {p.apellidos}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Table sx={{ mt: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Profesor</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {creando && (
                <TableRow>
                  <TableCell><TextField name="nombre" value={formData.nombre} onChange={handleChange} /></TableCell>
                  <TableCell><TextField name="descripcion" value={formData.descripcion} onChange={handleChange} /></TableCell>
                  <TableCell>
                    <FormControl fullWidth>
                      <Select name="profesor_id" value={formData.profesor_id} onChange={handleChange}>
                        {profesores.map(p => (
                          <MenuItem key={p.id} value={String(p.id)}>{p.nombre} {p.apellidos}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <Button size="small" variant="contained" onClick={handleGuardar}>Guardar</Button>
                    <Button size="small" onClick={handleCancelar}>Cancelar</Button>
                  </TableCell>
                </TableRow>
              )}
              {clases
                .filter(c => c.nombre.toLowerCase().includes(filtroNombre.toLowerCase()) && (filtroProfesor === '' || String(c.profesor_id) === filtroProfesor))
                .map(clase => (
                  editandoId === clase.id ? (
                    <TableRow key={clase.id}>
                      <TableCell><TextField name="nombre" value={formData.nombre} onChange={handleChange} /></TableCell>
                      <TableCell><TextField name="descripcion" value={formData.descripcion} onChange={handleChange} /></TableCell>
                      <TableCell>
                        <FormControl fullWidth>
                          <Select name="profesor_id" value={formData.profesor_id} onChange={handleChange}>
                            {profesores.map(p => (
                              <MenuItem key={p.id} value={String(p.id)}>{p.nombre} {p.apellidos}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <Button size="small" variant="contained" onClick={handleGuardar}>Guardar</Button>
                        <Button size="small" onClick={handleCancelar}>Cancelar</Button>
                        <Button size="small" color="error" onClick={() => confirmarEliminacion(clase)}>Eliminar</Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow key={clase.id}>
                      <TableCell>{clase.nombre}</TableCell>
                      <TableCell>{clase.descripcion}</TableCell>
                      <TableCell>{obtenerNombreProfesor(clase.profesor_id)}</TableCell>
                      <TableCell>
                        <Button size="small" onClick={() => handleEditar(clase)}>Editar</Button>
                        <Button size="small" color="error" onClick={() => confirmarEliminacion(clase)}>Eliminar</Button>
                      </TableCell>
                    </TableRow>
                  )
                ))}
            </TableBody>
          </Table>
        </Paper>
      )
    });

    tabs.push({
      label: 'Asignar Alumno a Clase',
      content: (
        <Paper sx={{ p: 4, mt: 4 }}>
          <Typography variant="h5" gutterBottom>Asignar Alumno a Clase</Typography>
          <AsignarAlumnoAClase />
        </Paper>
      )
    });
  }

  if (user?.rol === 'alumno') {
    tabs.push({
      label: 'Mis Clases',
      content: (
        <Paper sx={{ p: 4, mt: 4 }}>
          <Typography variant="h5" gutterBottom>Mis Clases</Typography>
          <MisClases userId={Number(user.id)} rol={user.rol} />
        </Paper>
      )
    });
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Tabs value={tabIndex} onChange={(_, newIndex) => setTabIndex(newIndex)} centered>
        {tabs.map((tab, index) => (
          <Tab key={index} label={tab.label} />
        ))}
      </Tabs>

      {tabs[tabIndex]?.content}

      <Dialog open={openDialog} onClose={cancelarEliminacion}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar la clase{' '}
            <strong>{claseAEliminar?.nombre}</strong>? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelarEliminacion}>Cancelar</Button>
          <Button onClick={eliminarClaseConfirmada} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Classes;
