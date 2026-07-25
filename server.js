import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import authRoutes     from './routes/auth.js'
import productRoutes  from './routes/products.js'
import orderRoutes    from './routes/orders.js'
import reviewRoutes   from './routes/reviews.js'
import wishlistRoutes from './routes/wishlist.js'

dotenv.config()

const app = express()

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

// Routes
app.use('/api/auth',     authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders',   orderRoutes)
app.use('/api/reviews',  reviewRoutes)
app.use('/api/wishlist', wishlistRoutes)

app.get('/', (req, res) => {
  res.send('NextStore API is running...')
})

// DB connect + server start
const startServer = async () => {
  try {
    await connectDB()
    if (process.env.NODE_ENV !== 'production') {
      const PORT = process.env.PORT || 5000
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
    }
  } catch (error) {
    console.error('Failed to connect to DB:', error)
  }
}

startServer()

export default app