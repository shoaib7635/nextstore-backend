import Product from '../models/Product.js'
import { uploadToCloudinary, deleteFromCloudinary } from '../middleware/upload.js'

// ============================================
// GET /api/products — Sab products (with search & filter)
// ============================================
export const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 12
    } = req.query

    let query = { isActive: true }

    // Search — name ya description mein
    if (search) {
      query.$text = { $search: search }
    }

    // Category filter
    if (category) {
      query.category = category
    }

    // Price filter
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number(minPrice)
      if (maxPrice) query.price.$lte = Number(maxPrice)
    }

    // Sorting
    let sortOption = {}
    if (sort === 'price_low')  sortOption = { price: 1 }
    if (sort === 'price_high') sortOption = { price: -1 }
    if (sort === 'newest')     sortOption = { createdAt: -1 }
    if (sort === 'popular')    sortOption = { sold: -1 }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit)
    const total = await Product.countDocuments(query)

    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))

    res.json({
      products,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      total
    })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ============================================
// GET /api/products/:id — Single product detail
// ============================================
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.json(product)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ============================================
// POST /api/products — Naya product add (Admin)
// ============================================
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body

    if (!name || !description || !price || !category || !stock) {
      return res.status(400).json({ message: 'Please fill all fields' })
    }

    // Images upload karo Cloudinary par
    const images = []
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer)
        images.push({
          url:      result.secure_url,
          publicId: result.public_id
        })
      }
    }

    const product = await Product.create({
      name, description,
      price:    Number(price),
      category,
      stock:    Number(stock),
      images
    })

    res.status(201).json(product)

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ============================================
// PUT /api/products/:id — Product update (Admin)
// ============================================
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    const { name, description, price, category, stock } = req.body

    product.name        = name        || product.name
    product.description = description || product.description
    product.price       = price       ? Number(price) : product.price
    product.category    = category    || product.category
    product.stock       = stock       ? Number(stock) : product.stock

    // Naye images upload karo agar bheje hain
    if (req.files && req.files.length > 0) {
      // Purani images Cloudinary se delete karo
      for (const img of product.images) {
        await deleteFromCloudinary(img.publicId)
      }
      // Nayi images upload karo
      const images = []
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer)
        images.push({ url: result.secure_url, publicId: result.public_id })
      }
      product.images = images
    }

    const updated = await product.save()
    res.json(updated)

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ============================================
// DELETE /api/products/:id — Product delete (Admin - Soft Delete)
// ============================================
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    // Soft delete — sirf isActive false karo
    product.isActive = false
    await product.save()

    res.json({ message: 'Product removed successfully' })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ============================================
// GET /api/products/admin/all — Admin ke liye sab products (inactive bhi)
// ============================================
export const getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 })
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}