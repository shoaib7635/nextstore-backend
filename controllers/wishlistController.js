import User from '../models/User.js'

// ============================================
// POST /api/wishlist/:productId — Wishlist mein add/remove (toggle)
// ============================================
export const toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const productId = req.params.productId

    // Already wishlist mein hai? Remove karo, warna add karo
    const index = user.wishlist.indexOf(productId)

    if (index > -1) {
      // Remove karo
      user.wishlist.splice(index, 1)
      await user.save()
      res.json({ message: 'Removed from wishlist', wishlist: user.wishlist })
    } else {
      // Add karo
      user.wishlist.push(productId)
      await user.save()
      res.json({ message: 'Added to wishlist', wishlist: user.wishlist })
    }

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ============================================
// GET /api/wishlist — Apni wishlist dekho
// ============================================
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('wishlist', 'name price images ratings stock isActive')

    // Sirf active products dikhao
    const activeWishlist = user.wishlist.filter(p => p.isActive)

    res.json(activeWishlist)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}