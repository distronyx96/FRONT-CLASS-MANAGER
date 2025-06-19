import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ClockButton from './ClockButton';

const Header = ({
  nombreUsuario,
}: {
  nombreUsuario: string;
}) => {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar sx={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Typography variant="h6">Mi App</Typography>

        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <ClockButton />
          <Typography variant="body1">Hola, {nombreUsuario}</Typography>
          <Button color="inherit" onClick={() => navigate('/perfil')}>
            Perfil
          </Button>
          <Button color="inherit" onClick={() => {logout();}}>
            Cerrar sesión
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
