// src/pages/User.tsx
import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Alert,
  Button,
  Modal,
  TextField,
  Stack,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

interface User {
  id: number;
  username: string;
  rol: string;
  nombre: string;
  apellidos: string;
  direccion: string;
  telefono: string;
  dni: string;
  fecha_nacimiento: string;
}

export default function UserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rol: '',
    nombre: '',
    apellidos: '',
    direccion: '',
    telefono: '',
    dni: '',
    fecha_nacimiento: ''
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:2000/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('No tienes permiso para ver esta página.');
      } else {
        setError('Error al cargar los usuarios.');
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteClick = (id: number) => {
    setUserToDelete(id);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:2000/users`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { id: userToDelete }
      });
      setSuccessMsg('Usuario eliminado correctamente.');
      fetchUsers();
    } catch (err: any) {
      setError('No se pudo eliminar el usuario.');
    } finally {
      setConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  const handleCreateOrUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const method = editMode ? 'patch' : 'post';

      const payload = {
        id: currentUserId,
        username: formData.username,
        password: formData.password,
        rol: formData.rol,
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        direccion: formData.direccion,
        telefono: formData.telefono,
        dni: formData.dni,
        fecha_nacimiento: formData.fecha_nacimiento
      };

      await axios({
        method,
        url: 'http://localhost:2000/users',
        data: payload,
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccessMsg(editMode ? 'Usuario actualizado con éxito.' : 'Usuario creado con éxito.');
      setFormData({
        username: '',
        password: '',
        rol: '',
        nombre: '',
        apellidos: '',
        direccion: '',
        telefono: '',
        dni: '',
        fecha_nacimiento: ''
      });
      setOpenModal(false);
      setEditMode(false);
      setCurrentUserId(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error en la operación.');
    }
  };

  const openEditModal = (user: User) => {
    setFormData({
      username: user.username || '',
      password: '',
      rol: user.rol || '',
      nombre: user.nombre || '',
      apellidos: user.apellidos || '',
      direccion: user.direccion || '',
      telefono: user.telefono || '',
      dni: user.dni || '',
      fecha_nacimiento: user.fecha_nacimiento?.split('T')[0] || ''
    });
    setEditMode(true);
    setCurrentUserId(user.id);
    setOpenModal(true);
  };

  return (
    <Box sx={{ mt: 4, px: 4 }}>
      <Typography variant="h4" gutterBottom>Gestión de Usuarios</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

      <Button variant="contained" onClick={() => setOpenModal(true)} sx={{ mb: 2 }}>
        Crear Usuario
      </Button>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Apellidos</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Dirección</TableCell>
              <TableCell>DNI</TableCell>
              <TableCell>Fecha de Nacimiento</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.rol}</TableCell>
                <TableCell>{user.nombre}</TableCell>
                <TableCell>{user.apellidos}</TableCell>
                <TableCell>{user.telefono}</TableCell>
                <TableCell>{user.direccion}</TableCell>
                <TableCell>{user.dni}</TableCell>
                <TableCell>
                  {user.fecha_nacimiento ? new Date(user.fecha_nacimiento).toLocaleDateString('es-ES') : ''}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => openEditModal(user)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDeleteClick(user.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Modal para crear/editar usuario */}
      <Modal open={openModal} onClose={() => {
        setOpenModal(false);
        setEditMode(false);
        setFormData({
          username: '',
          password: '',
          rol: '',
          nombre: '',
          apellidos: '',
          direccion: '',
          telefono: '',
          dni: '',
          fecha_nacimiento: ''
        });
      }}>
        <Box sx={{ p: 4, bgcolor: 'white', borderRadius: 2, boxShadow: 24, width: 500, mx: 'auto', mt: '5%' }}>
          <Typography variant="h6" gutterBottom>
            {editMode ? 'Editar Usuario' : 'Crear Usuario'}
          </Typography>
          <Stack spacing={2}>
            <TextField label="Username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} fullWidth />
            <TextField
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Rol</InputLabel>
              <Select
                label="Rol"
                value={formData.rol}
                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="profesor">Profesor</MenuItem>
                <MenuItem value="alumno">Alumno</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} fullWidth />
            <TextField label="Apellidos" value={formData.apellidos} onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })} fullWidth />
            <TextField label="DNI" value={formData.dni} onChange={(e) => setFormData({ ...formData, dni: e.target.value })} fullWidth />
            <TextField label="Dirección" value={formData.direccion} onChange={(e) => setFormData({ ...formData, direccion: e.target.value })} fullWidth />
            <TextField label="Teléfono" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} fullWidth />
            <TextField
              label="Fecha de nacimiento"
              type="date"
              value={formData.fecha_nacimiento}
              onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <Button variant="contained" onClick={handleCreateOrUpdate}>
              {editMode ? 'Actualizar' : 'Crear'}
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}