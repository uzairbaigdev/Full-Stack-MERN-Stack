import { useEffect } from 'react'
import {Routes, Route} from 'react-router-dom'
import Register from './pages/register/register.jsx'
import Login from "./pages/login/login.jsx"

function App() {

  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  )
}

export default App
