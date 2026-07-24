import Order from '../models/Order.js'
import Product from '../models/Product.js'
import { sendEmail } from '../config/email.js'

// ============================================
// POST /api/orders — Naya order place karna
// ============================================
export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' })
    }

    // Har item ka price aur stock check karo
    let subtotal = 0
    const orderItems = []

    for (const item of items) {
      const product = await Product.findById(item.product)

      if (!product || !product.isActive) {
        return res.status(404).json({ message: `Product not found: ${item.product}` })
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` })
      }

      orderItems.push({
        product:  product._id,
        name:     product.name,
        image:    product.images[0]?.url || '',
        price:    product.price,
        quantity: item.quantity
      })

      subtotal += product.price * item.quantity
    }

    const shippingCost = subtotal > 5000 ? 0 : 200  // 5000 se upar free shipping
    const total = subtotal + shippingCost

    // Order banao
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost,
      total,
      isPaid: paymentMethod === 'cod' ? false : false
    })

    // Stock update karo — har product ka stock ghata do
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, sold: item.quantity }
      })
    }

    // Customer ko confirmation email bhejo
    await sendEmail({
      to: req.user.email,
      subject: `✅ Order Confirmed — NextStore #${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1d4ed8; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">NextStore</h1>
          </div>
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e293b;">Order Confirmed! 🎉</h2>
            <p style="color: #64748b;">Hello <strong>${req.user.name}</strong>, your order has been placed successfully.</p>

            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #1d4ed8; margin-top: 0;">Order Details</h3>
              <p><strong>Order ID:</strong> #${order._id}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Payment:</strong> ${paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
            </div>

            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #1d4ed8; margin-top: 0;">Items Ordered</h3>
              ${orderItems.map(item => `
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                  <span>${item.name} x ${item.quantity}</span>
                  <strong>Rs. ${(item.price * item.quantity).toLocaleString()}</strong>
                </div>
              `).join('')}
              <div style="margin-top: 15px;">
                <p style="display: flex; justify-content: space-between;">
                  <span>Subtotal:</span> <strong>Rs. ${subtotal.toLocaleString()}</strong>
                </p>
                <p style="display: flex; justify-content: space-between;">
                  <span>Shipping:</span> <strong>${shippingCost === 0 ? 'Free' : `Rs. ${shippingCost}`}</strong>
                </p>
                <p style="display: flex; justify-content: space-between; font-size: 18px; color: #1d4ed8;">
                  <span>Total:</span> <strong>Rs. ${total.toLocaleString()}</strong>
                </p>
              </div>
            </div>

            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #1d4ed8; margin-top: 0;">Delivery Address</h3>
              <p style="color: #64748b; margin: 0;">
                ${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.country}
              </p>
            </div>

            <p style="color: #64748b; text-align: center;">
              We will notify you once your order is shipped with estimated delivery time.
            </p>
          </div>
          <div style="background: #1e293b; padding: 15px; text-align: center;">
            <p style="color: #94a3b8; margin: 0;">© 2026 NextStore. All rights reserved.</p>
          </div>
        </div>
      `
    })

    // Admin ko notification email bhejo
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `🛒 New Order Received — #${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1d4ed8;">New Order Received!</h2>
          <p><strong>Customer:</strong> ${req.user.name} (${req.user.email})</p>
          <p><strong>Order ID:</strong> #${order._id}</p>
          <p><strong>Total:</strong> Rs. ${total.toLocaleString()}</p>
          <p><strong>Items:</strong></p>
          <ul>
            ${orderItems.map(item => `<li>${item.name} x ${item.quantity} — Rs. ${(item.price * item.quantity).toLocaleString()}</li>`).join('')}
          </ul>
          <p><strong>Delivery Address:</strong> ${shippingAddress.street}, ${shippingAddress.city}</p>
          <p><strong>Payment:</strong> ${paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
          <a href="http://localhost:5173/admin/orders" style="background: #1d4ed8; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none;">View Order</a>
        </div>
      `
    })

    res.status(201).json(order)

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ============================================
// GET /api/orders/myorders — Customer apne orders dekhe
// ============================================
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name images')

    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ============================================
// GET /api/orders/:id — Single order detail
// ============================================
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name images')

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    // Customer sirf apna order dekh sakta hai
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' })
    }

    res.json(order)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ============================================
// GET /api/orders — Admin sab orders dekhe
// ============================================
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })

    res.json(orders)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ============================================
// PUT /api/orders/:id/status — Admin order status update kare
// ============================================
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, estimatedDelivery, adminNote } = req.body

    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    order.status = status || order.status
    if (estimatedDelivery) order.estimatedDelivery = new Date(estimatedDelivery)
    if (adminNote) order.adminNote = adminNote

    const updated = await order.save()

    // Customer ko status update email bhejo
    await sendEmail({
      to: order.user.email,
      subject: `📦 Order Update — NextStore #${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1d4ed8; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">NextStore</h1>
          </div>
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e293b;">Order Status Updated</h2>
            <p>Hello <strong>${order.user.name}</strong>,</p>
            <p>Your order <strong>#${order._id}</strong> status has been updated.</p>

            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p><strong>New Status:</strong>
                <span style="background: #dbeafe; color: #1d4ed8; padding: 4px 12px; border-radius: 20px;">
                  ${status.toUpperCase()}
                </span>
              </p>
              ${estimatedDelivery ? `
                <p><strong>Estimated Delivery:</strong>
                  ${new Date(estimatedDelivery).toLocaleDateString('en-PK', {
                    weekday: 'long', year: 'numeric',
                    month: 'long', day: 'numeric'
                  })}
                </p>
              ` : ''}
              ${adminNote ? `<p><strong>Message from NextStore:</strong> ${adminNote}</p>` : ''}
            </div>
          </div>
          <div style="background: #1e293b; padding: 15px; text-align: center;">
            <p style="color: #94a3b8; margin: 0;">© 2026 NextStore. All rights reserved.</p>
          </div>
        </div>
      `
    })

    res.json(updated)

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ============================================
// GET /api/orders/admin/stats — Dashboard stats
// ============================================
export const getDashboardStats = async (req, res) => {
  try {
    const totalOrders    = await Order.countDocuments()
    const pendingOrders  = await Order.countDocuments({ status: 'pending' })
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' })

    // Total revenue
    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ])
    const totalRevenue = revenueResult[0]?.total || 0

    // Total products
    const totalProducts     = await Product.countDocuments({ isActive: true })
    const lowStockProducts  = await Product.find({ isActive: true, stock: { $lte: 5 } })
      .select('name stock')

    // Recent orders
    const recentOrders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)

    // Top selling products
    const topProducts = await Product.find({ isActive: true })
      .sort({ sold: -1 })
      .limit(5)
      .select('name sold stock price')

    res.json({
      totalOrders,
      pendingOrders,
      deliveredOrders,
      totalRevenue,
      totalProducts,
      lowStockProducts,
      recentOrders,
      topProducts
    })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}