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

// CORS — frontend URL allow karein
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://nextstore-frontend-pearl.vercel.app',
    'https://nextstore-frontend-imeiwikrd.vercel.app',
    /\.vercel\.app$/  // Sab Vercel URLs allow karein
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

app.use(express.json())

app.use('/api/auth',     authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders',   orderRoutes)
app.use('/api/reviews',  reviewRoutes)
app.use('/api/wishlist', wishlistRoutes)

app.get('/', (req, res) => {
  res.send('NextStore API is running...')
})

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