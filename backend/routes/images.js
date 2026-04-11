const express = require('express');
const multer = require('multer');
const { auth, authorize } = require('../middleware/auth');
const { uploadImage, deleteImage } = require('../lib/cloudinary');

const router = express.Router();

// Configure multer for memory storage (no local files)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload single image
router.post('/upload', [
  auth,
  upload.single('image')
], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Upload to Cloudinary
    const result = await uploadImage(req.file, 'bidblaze-auctions');

    res.json({
      message: 'Image uploaded successfully',
      image: {
        url: result.url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.size
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ 
      message: 'Failed to upload image',
      error: error.message 
    });
  }
});

// Upload multiple images
router.post('/upload-multiple', [
  auth,
  authorize('seller', 'admin'),
  upload.array('images', 10) // Max 10 images
], async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No image files provided' });
    }

    const uploadPromises = req.files.map(file => uploadImage(file, 'bidblaze-auctions'));
    const results = await Promise.all(uploadPromises);

    res.json({
      message: `${results.length} images uploaded successfully`,
      images: results.map(result => ({
        url: result.url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.size
      }))
    });
  } catch (error) {
    console.error('Multiple image upload error:', error);
    res.status(500).json({ 
      message: 'Failed to upload images',
      error: error.message 
    });
  }
});

// Delete image
router.delete('/:publicId', [
  auth,
  authorize('seller', 'admin')
], async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // Delete from Cloudinary
    await deleteImage(publicId);

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(500).json({ 
      message: 'Failed to delete image',
      error: error.message 
    });
  }
});

// Error handling for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB' });
    }
    return res.status(400).json({ message: 'File upload error', error: error.message });
  }
  
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({ message: error.message });
  }
  
  next(error);
});

module.exports = router;
