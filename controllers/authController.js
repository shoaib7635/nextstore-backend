import User from '../models/User.js'
import jwt from 'jsonwebtoken'

// JWT token generate karne ka function
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

// ============================================
// POST /api/auth/register — Naya user banana
// ============================================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Validation — sab fields honi chahiye
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill all fields' })
    }

    // Check karo email pehle se registered to nahi
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    // Naya user banao — password Model mein khud hash ho jayega (pre save hook)
    const user = await User.create({ name, email, password })

    // Token ke sath response bhejo
    res.status(201).json({
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role
      },
      token: generateToken(user._id)
    })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ============================================
// POST /api/auth/login — Login karna
// ============================================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please fill all fields' })
    }

    // Email se user dhoondo
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Password match karo (Model ka method use kiya)
    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    res.json({
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role
      },
      token: generateToken(user._id)
    })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ============================================
// GET /api/auth/me — Apna profile dekho
// ============================================
export const getMe = async (req, res) => {
  // req.user already set hai authMiddleware se
  res.json(req.user)
}

// ============================================
// PUT /api/auth/profile — Profile update karo
// ============================================
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Jo bhi bheja hai woh update karo
    user.name = req.body.name || user.name
    user.address = req.body.address || user.address

    // Agar naya password bheja to update karo
    if (req.body.password) {
      user.password = req.body.password  // Model ka pre-save hook khud hash karega
    }

    const updatedUser = await user.save()

    res.json({
      id:    updatedUser._id,
      name:  updatedUser.name,
      email: updatedUser.email,
      role:  updatedUser.role
    })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}