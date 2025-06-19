import { Box, Typography, Button } from '@mui/material';

function Welcome() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        bgcolor: '#f4f6f8',
        padding: 3,
      }}
    >
      <Typography variant="h3" component="h1" gutterBottom>
        ¡Bienvenido al Dashboard!
      </Typography>
      <Typography variant="h6" component="p" gutterBottom>
        Aquí puedes gestionar tus clases, revisar estadísticas y mucho más.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 3 }}
        onClick={() => alert('¡Explora el dashboard!')}
      >
        Explorar
      </Button>
    </Box>
  );
}

export default Welcome;