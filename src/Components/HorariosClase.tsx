import React, { useEffect, useState } from 'react';
import {
  Typography, Box, List, ListItem, ListItemText, IconButton,
  TextField, Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

interface Horario {
  id: number;
  dia: string;
  hora_inicio: string;
  hora_fin: string;
}

interface Props {
  claseId: number;
}

export const HorariosClase: React.FC<Props> = ({ claseId }) => {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [nuevoHorario, setNuevoHorario] = useState({
    dia: '',
    hora_inicio: '',
    hora_fin: ''
  });

  const fetchHorarios = async () => {
    try {
      const res = await axios.get(`/clases/${claseId}/horarios`);

      setHorarios(res.data);
    } catch (error) {
      console.error('Error al cargar horarios', error);
    }
  };

  useEffect(() => {
    fetchHorarios();
  }, [claseId]);

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/horarios/${id}`);
      fetchHorarios();
    } catch (error) {
      console.error('Error al eliminar horario', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNuevoHorario({ ...nuevoHorario, [e.target.name]: e.target.value });
  };

  const handleAgregar = async () => {
    const { dia, hora_inicio, hora_fin } = nuevoHorario;
    if (!dia || !hora_inicio || !hora_fin) return;

    try {
      await axios.post(`/clases/${claseId}/horarios`, nuevoHorario);
      setNuevoHorario({ dia: '', hora_inicio: '', hora_fin: '' });
      fetchHorarios();
    } catch (error) {
      console.error('Error al agregar horario', error);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6">Horarios de la Clase</Typography>
      <List>
        {horarios.map((horario) => (
          <ListItem
            key={horario.id}
            secondaryAction={
              <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(horario.id)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={`${horario.dia} - ${horario.hora_inicio} a ${horario.hora_fin}`}
            />
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="subtitle1">Agregar nuevo horario</Typography>
        <TextField
          label="Día"
          name="dia"
          value={nuevoHorario.dia}
          onChange={handleChange}
          placeholder="Ej: lunes"
        />
        <TextField
          label="Hora inicio"
          name="hora_inicio"
          value={nuevoHorario.hora_inicio}
          onChange={handleChange}
          type="time"
        />
        <TextField
          label="Hora fin"
          name="hora_fin"
          value={nuevoHorario.hora_fin}
          onChange={handleChange}
          type="time"
        />
        <Button variant="contained" onClick={handleAgregar}>
          Agregar Horario
        </Button>
      </Box>
    </Box>
  );
};
