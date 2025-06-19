import LoginForm from '../Components/LoginForm'
import '../styles/login.css'

export default function Login() {
  return (
    <div className="login-container">
      <h1>Class Manager</h1>
      <h2>Iniciar sesión</h2>
      <LoginForm />
    </div>
  )
}
