import AllAsistencias from "../Components/AllAsistencias";
import { jwtDecode } from "jwt-decode";

interface TokenData {
  rol: string;
}

export default function AdminDashboard() {
  const token = localStorage.getItem('token');
  let rol = '';

  try {
    if (token) {
      const decoded = jwtDecode<TokenData>(token);
      rol = decoded.rol;
    }
  } catch {
    rol = '';
  }

  return (
    <>
      {rol === 'admin' ? (
        <AllAsistencias />
      ) : (
        <p>No tienes permiso para ver esta información.</p>
      )}
    </>
  );
}
