import React, { createContext, useContext, useState, useEffect } from "react";

interface Usuario {
  id: string;
  username: string;
  rol: string;
  nombre?: string;
  apellidos?: string;
  direccion?: string;
  telefono?: string;
  dni?: string;
  fecha_nacimiento?: string;
}

interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  login: (user: Usuario, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
});

// Función para decodificar JWT
function parseJwt(token: string): Usuario | null {
  try {
    const payloadBase64 = token.split(".")[1];
    const payload = atob(payloadBase64);
    return JSON.parse(payload);
  } catch (err) {
    console.error("Error al decodificar JWT:", err);
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenGuardado = localStorage.getItem("token");
    if (tokenGuardado && tokenGuardado !== "undefined") {
      const userDecoded = parseJwt(tokenGuardado);
      setUser(userDecoded);
      setToken(tokenGuardado);
    }
  }, []);

  const login = (userData: Usuario, token: string) => {
    setUser(userData);
    setToken(token);
    localStorage.setItem("token", token);
    // ya no guardamos "user" porque lo podemos extraer del token
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
