import express from 'express'
import {
  getProducts, getProductById, createProduct,
  updateProduct, deleteProduct, getAdminProducts
} from '../controllers/productController.js'
import { protect, adminOnly } from '../middleware/authMiddleware.js'
import upload from '../middleware/upload.js'

const router = express.Router()

// ⚠️ Admin route pehle aana chahiye — warna :id se match ho jata hai
router.get('/admin/all', protect, adminOnly, getAdminProducts)

// Public routes
router.get('/',    getProducts)
router.get('/:id', getProductById)

// Admin CRUD
router.post('/',    protect, adminOnly, upload.array('images', 5), createProduct)
router.put('/:id',  protect, adminOnly, upload.array('images', 5), updateProduct)
router.delete('/:id', protect, adminOnly, deleteProduct)

export default router