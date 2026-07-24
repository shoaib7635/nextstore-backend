import Review from '../models/Review.js'
import Product from '../models/Product.js'

// ============================================
// POST /api/reviews/:productId — Review add karo
// ============================================
export const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body
    const productId = req.params.productId

    // Product exist karta hai?
    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    // Kya is user ne pehle review diya tha?
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user._id
    })
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' })
    }

    // Review banao
    const review = await Review.create({
      product: productId,
      user:    req.user._id,
      name:    req.user.name,
      rating:  Number(rating),
      comment
    })

    // Product ki average rating update karo
    const allReviews = await Review.find({ product: productId })
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

    product.ratings    = avgRating
    product.numReviews = allReviews.length
    await product.save()

    res.status(201).json(review)

  } catch (error) {
    // Duplicate review error handle karo
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this product' })
    }
    res.status(500).json({ message: error.message })
  }
}

// ============================================
// GET /api/reviews/:productId — Product ke reviews dekho
// ============================================
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .sort({ createdAt: -1 })
    res.json(reviews)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ============================================
// DELETE /api/reviews/:id — Review delete karo (Admin)
// ============================================
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
    if (!review) {
      return res.status(404).json({ message: 'Review not found' })
    }

    // Sirf review owner ya admin delete kar sakta hai
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' })
    }

    await Review.findByIdAndDelete(req.params.id)

    // Product ki rating dobara calculate karo
    const product = await Product.findById(review.product)
    const allReviews = await Review.find({ product: review.product })

    if (allReviews.length === 0) {
      product.ratings    = 0
      product.numReviews = 0
    } else {
      product.ratings    = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      product.numReviews = allReviews.length
    }

    await product.save()
    res.json({ message: 'Review deleted' })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}