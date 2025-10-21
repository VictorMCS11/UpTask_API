import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'
import { connectDB } from './config/db'
import projectRoutes from './routes/projectRoutes'
import authRoutes from './routes/authRoutes'
import { corsConfig } from './config/cors'

dotenv.config()

// Conectar a MongoDB
connectDB()

const app = express()

//Logging
app.use(morgan('dev'))

app.use(cors(corsConfig))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)

export default app 