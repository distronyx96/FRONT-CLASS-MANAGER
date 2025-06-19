import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/SpaceDashboard';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArticleIcon from '@mui/icons-material/Article';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import ClockButton from '../Components/ClockButton'; 

export default function DashboardLayout() {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [rolUsuario, setRolUsuario] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setNombreUsuario(decoded.nombre || '');
        setRolUsuario(decoded.rol || '');
      } catch (error) {
        console.error('Error al decodificar token:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/welcome' },
    ...(rolUsuario === 'admin'
      ? [{ text: 'User', icon: <PersonIcon />, path: '/user' }]
      : []),
    { text: 'Clock-in/out', icon: <AccessTimeIcon />, path: '/fichaje' },
    { text: 'Classes', icon: <ArticleIcon />, path: '/classes' },
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* AppBar superior */}
      <AppBar position="fixed" sx={{ zIndex: 1201 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Nombre del usuario */}
          <Typography variant="h6">Bienvenido {nombreUsuario}</Typography>

          {/* Botón Clock In/Out */}
          <ClockButton />

          {/* Botones de perfil y logout */}
          <Box>
            <Button color="inherit" onClick={() => navigate('/perfil')}>
              Perfil
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer lateral */}
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: 240,
            boxSizing: 'border-box',
            mt: 8,
            backgroundColor: '#f9fafb'
          }
        }}
      >
        <Box sx={{ p: 2, fontWeight: 'bold', fontSize: 20 }}>Class Manager</Box>
        <List>
          {menuItems.map((item) => (
            <ListItem
              key={item.text}
              component={NavLink}
              to={item.path}
              sx={{
                '&.active': {
                  backgroundColor: '#e3f2fd',
                  fontWeight: 'bold',
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: '#f4f6f8',
          mt: 8
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
