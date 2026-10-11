import express from 'express'
import 'dotenv/config'
import path from 'path'
import { fileURLToPath } from 'url'
import { connectToDatabase } from './config/database.js'
import registerRoute from './routes/register.js'
import dns from "node:dns";
dns.setServers(["192.168.0.1"]);
import loginRoute from './routes/login.js'

const app = express()
const port = process.env.PORT || 3000
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.json())
app.use('/register', registerRoute)
app.use('/login', loginRoute)
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

const startServer = () => {
  app.listen(port, () => {
    console.log(`server is running on port ${port}`)
  })
}

connectToDatabase()
  .then(startServer)
  .catch((error) => {
    console.error('Database connection failed. Starting server without MongoDB:', error.message)
    startServer()
  })