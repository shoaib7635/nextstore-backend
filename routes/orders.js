import express from 'express'
import {
  createOrder, getMyOrders, getOrderById,
  getAllOrders, updateOrderStatus, getDashboardStats
} from '../controllers/orderController.js'
import { protect, adminOnly } from '../middleware/authMiddleware.js'

const router = express.Router()

// ⚠️ Specific routes pehle, phir :id wale
router.get('/admin/stats', protect, adminOnly, getDashboardStats)
router.get('/myorders',    protect, getMyOrders)

router.post('/',           protect, createOrder)
router.get('/',            protect, adminOnly, getAllOrders)
router.get('/:id',         protect, getOrderById)
router.put('/:id/status',  protect, adminOnly, updateOrderStatus)

export default router