import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Paper,
  TableContainer,
} from "@mui/material";

interface Asistencia {
  id: number;
  nombre: string;
  apellidos: string;
  DNI: string;
  fecha_inicio: string;
  fecha_fin: string | null;
}

const Fichaje: React.FC = () => {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");

  useEffect(() => {
    const cargarAsistencias = async () => {
      if (!localStorage.token) return;

      try {
        const respuesta = await fetch("http://localhost:2000/asistencias", {
          headers: {
            Authorization: `Bearer ${localStorage.token}`,
          },
        });

        if (!respuesta.ok) {
          throw new Error("Error al cargar asistencias");
        }

        const data = await respuesta.json();
        console.log("Asistencias:", data);
        setAsistencias(data);
      } catch (error) {
        console.error("Error al cargar asistencias", error);
      }
    };

    cargarAsistencias();
  }, []);

  const asistenciasFiltradas = asistencias.filter((a) => {
    const nombreCoincide = a.nombre.toLowerCase().includes(filtroNombre.toLowerCase());
    const fechaCoincide = a.fecha_inicio.slice(0, 10).includes(filtroFecha);

    return nombreCoincide && fechaCoincide;
  });

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Historial de Fichajes
      </Typography>

      {/* Filtros */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="Filtrar por nombre"
          value={filtroNombre}
          onChange={(e) => setFiltroNombre(e.target.value)}
          variant="outlined"
          size="small"
        />
        <TextField
          label="Filtrar por fecha (YYYY-MM-DD)"
          value={filtroFecha}
          onChange={(e) => setFiltroFecha(e.target.value)}
          variant="outlined"
          size="small"
        />
      </Box>

      {/* Tabla de asistencias */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Nombre</strong></TableCell>
              <TableCell><strong>Apellidos</strong></TableCell>
              <TableCell><strong>DNI</strong></TableCell>
              <TableCell><strong>Fecha Inicio</strong></TableCell>
              <TableCell><strong>Fecha Fin</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {asistenciasFiltradas.length > 0 ? (
              asistenciasFiltradas.map((a, index) => (
                <TableRow key={index}>
                  <TableCell>{a.nombre}</TableCell>
                  <TableCell>{a.apellidos}</TableCell>
                  <TableCell>{a.DNI}</TableCell>
                  <TableCell>{new Date(a.fecha_inicio).toLocaleString()}</TableCell>
                  <TableCell>
                    {a.fecha_fin ? new Date(a.fecha_fin).toLocaleString() : "—"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No se encontraron registros
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Fichaje;
