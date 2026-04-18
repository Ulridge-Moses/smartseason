import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.js'
import fieldRoutes from './routes/fields.js'
import updateRoutes from './routes/updates.js'

const app = express()
const PORT = process.env.PORT || 3000

// Security middleware
app.use(helmet())
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

// Body parsing
app.use(express.json())
app.use(cookieParser())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/fields', fieldRoutes)
app.use('/api/fields', updateRoutes)

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'SmartSeason API is running' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app