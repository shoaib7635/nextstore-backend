import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true   // User ka naam (display ke liye)
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5           // 1 to 5 stars
  },
  comment: {
    type: String,
    required: true
  }
}, { timestamps: true })

// Ek user ek product par sirf ek review de sakta hai
reviewSchema.index({ product: 1, user: 1 }, { unique: true })

const Review = mongoose.model('Review', reviewSchema)
export default Review