// src/pages/Perfil.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Snackbar,
  Alert
} from '@mui/material';
import axios from 'axios';

const Perfil = () => {
  const [usuario, setUsuario] = useState({
    username: '',
    nombre: '',
    apellidos: '',
    direccion: '',
    fecha_nacimiento: '',
    telefono: '',
    password: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [mensaje, setMensaje] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [severity, setSeverity] = useState<'success' | 'error'>('success');

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios
      .get('http://localhost:2000/perfil', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUsuario({
          ...res.data,
          password: '',
          newPassword: '',
          confirmPassword: ''
        });
      })
      .catch((err) => {
        console.error('Error al obtener el perfil:', err);
        setMensaje('Error al cargar el perfil');
        setSeverity('error');
        setOpenSnackbar(true);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsuario({ ...usuario, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que si hay nueva contraseña, coincida con la confirmación
    if (usuario.newPassword && usuario.newPassword !== usuario.confirmPassword) {
      setMensaje('Las contraseñas no coinciden');
      setSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    const token = localStorage.getItem('token');
    
    try {
      // Preparar datos para enviar
      const datosActualizacion = {
        username: usuario.username,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        direccion: usuario.direccion,
        fecha_nacimiento: usuario.fecha_nacimiento,
        telefono: usuario.telefono,
        ...(usuario.newPassword && {
          currentPassword: usuario.password,
          newPassword: usuario.newPassword
        })
      };

      await axios.patch('http://localhost:2000/perfil', datosActualizacion, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setMensaje('Perfil actualizado correctamente');
      setSeverity('success');
      setOpenSnackbar(true);
      
      // Limpiar campos de contraseña si se cambió
      if (usuario.newPassword) {
        setUsuario({
          ...usuario,
          password: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error: any) {
      console.error('Error al actualizar el perfil:', error);
      setMensaje(error.response?.data?.message || 'Error al actualizar el perfil');
      setSeverity('error');
      setOpenSnackbar(true);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Mi perfil
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          margin="normal"
          label="Username"
          name="username"
          value={usuario.username}
          onChange={handleChange}
          required
        />
        <TextField
          fullWidth
          margin="normal"
          label="Nombre"
          name="nombre"
          value={usuario.nombre}
          onChange={handleChange}
          required
        />
        <TextField
          fullWidth
          margin="normal"
          label="Apellidos"
          name="apellidos"
          value={usuario.apellidos}
          onChange={handleChange}
          required
        />
        <TextField
          fullWidth
          margin="normal"
          label="Dirección"
          name="direccion"
          value={usuario.direccion}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Fecha de nacimiento"
          name="fecha_nacimiento"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={usuario.fecha_nacimiento}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Teléfono"
          name="telefono"
          value={usuario.telefono}
          onChange={handleChange}
        />

        {/* Campos para cambiar contraseña */}
        <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
          Cambiar contraseña (opcional)
        </Typography>
        <TextField
          fullWidth
          margin="normal"
          label="Contraseña actual"
          type="password"
          name="password"
          value={usuario.password}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Nueva contraseña"
          type="password"
          name="newPassword"
          value={usuario.newPassword}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Confirmar nueva contraseña"
          type="password"
          name="confirmPassword"
          value={usuario.confirmPassword}
          onChange={handleChange}
        />
        
        <Button 
          variant="contained" 
          color="primary" 
          type="submit" 
          sx={{ mt: 2 }}
          fullWidth
        >
          Guardar cambios
        </Button>
      </Box>

      {/* Snackbar para mensajes */}
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={4000} 
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={severity}
          sx={{ width: '100%' }}
        >
          {mensaje}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Perfil;