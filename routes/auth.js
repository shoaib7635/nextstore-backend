import express from 'express'
import {
  registerUser,
  loginUser,
  getMe,
  updateProfile
} from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Public routes — koi bhi access kar sakta hai
router.post('/register', registerUser)
router.post('/login',    loginUser)

// Protected routes — sirf logged in user
router.get('/me',         protect, getMe)
router.put('/profile',    protect, updateProfile)

export default router