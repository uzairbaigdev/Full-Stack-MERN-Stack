import { useEffect } from 'react'
import {Routes, Route} from 'react-router-dom'
import Register from './pages/register/register.jsx'

function App() {

  return (
    <Routes>
      <Route path="/register" element={<Register />} />
    </Routes>
  )
}

export default App
