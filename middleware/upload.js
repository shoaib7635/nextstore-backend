import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'
dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Memory mein store karo (disk par nahi)
const storage = multer.memoryStorage()

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only images are allowed'), false)
    }
  }
})

// Cloudinary par upload karne ka helper function
export const uploadToCloudinary = (buffer, folder = 'nextstore') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    ).end(buffer)
  })
}

export const deleteFromCloudinary = async (publicId) => {
  await cloudinary.uploader.destroy(publicId)
}

export default upload