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

app.use(cors({ origin: '*' }))
app.use(express.json())

app.use(async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (err) {
    console.error('DB Error:', err.message)
    res.status(500).json({ message: 'Database connection failed' })
  }
})

app.use('/api/auth',     authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders',   orderRoutes)
app.use('/api/reviews',  reviewRoutes)
app.use('/api/wishlist', wishlistRoutes)

app.get('/', (req, res) => res.send('NextStore API is running...'))

export default app