import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  images: [{
    url:       { type: String, required: true },  // Cloudinary URL
    publicId:  { type: String, required: true }   // Cloudinary ID (delete ke liye)
  }],
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Clothes', 'Grocery', 'Books', 'Sports', 'Other']
  },
  stock: {
    type: Number,
    required: true,
    default: 0     // Kitne products available hain
  },
  sold: {
    type: Number,
    default: 0     // Kitne products sale hue — yeh automatically update hoga jab order hoga
  },
  ratings: {
    type: Number,
    default: 0     // Average rating (1-5)
  },
  numReviews: {
    type: Number,
    default: 0     // Total reviews count
  },
  isActive: {
    type: Boolean,
    default: true  // False karo to product hide ho jaye (soft delete)
  }
}, { timestamps: true })

// Search ke liye text index — name aur description pe search ho sake
productSchema.index({ name: 'text', description: 'text' })

const Product = mongoose.model('Product', productSchema)
export default Product