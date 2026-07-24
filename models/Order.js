import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name:     { type: String,  required: true },  // Product naam snapshot
    image:    { type: String,  required: true },  // Product image snapshot
    price:    { type: Number,  required: true },  // Us waqt ki price
    quantity: { type: Number,  required: true, default: 1 }
  }],
  shippingAddress: {
    street:  { type: String, required: true },
    city:    { type: String, required: true },
    country: { type: String, required: true },
    phone:   { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'cod'],  // cod = Cash on Delivery
    required: true
  },
  paymentResult: {
    id:     { type: String },  // Stripe payment ID
    status: { type: String },  // paid/failed
  },
  subtotal:     { type: Number, required: true, default: 0 },
  shippingCost: { type: Number, required: true, default: 0 },
  total:        { type: Number, required: true, default: 0 },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: {
    type: Date  // Kab pay hua
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  estimatedDelivery: {
    type: Date  // Admin yeh set karega — customer ko email jayegi
  },
  adminNote: {
    type: String,
    default: ''  // Admin ka message customer ke liye
  }
}, { timestamps: true })

const Order = mongoose.model('Order', orderSchema)
export default Order