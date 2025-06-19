import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Welcome from './pages/Welcome'
import DashboardLayout from './layouts/DashboardLayout'
import User from './pages/User'
import Perfil from './pages/Perfil'
import Fichaje from './pages/Fichaje'
import Classes from './pages/Classes'
import AdminDashboard from './pages/AdminDashboard' 

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta pública para login */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas bajo el layout */}
        <Route element={<DashboardLayout />}>
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/user" element={<User />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/fichaje" element={<Fichaje />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/admin" element={<AdminDashboard />} /> 
        </Route>
      </Routes>
    </Router>
  )
}

export default App
