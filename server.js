import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import authRoutes    from './routes/auth.js'
import productRoutes from './routes/products.js'
import orderRoutes   from './routes/orders.js'
import reviewRoutes  from './routes/reviews.js'
import wishlistRoutes from './routes/wishlist.js'

dotenv.config()
connectDB()

const app = express()

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

app.use('/api/auth',      authRoutes)
app.use('/api/products',  productRoutes)
app.use('/api/orders',    orderRoutes)
app.use('/api/reviews',   reviewRoutes)
app.use('/api/wishlist',  wishlistRoutes)

app.get('/', (req, res) => {
  res.send('NextStore API is running...')
})

// Vercel ke liye export
export default app

// Local development ke liye
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}