const { deleteImage } = require('./cloudinary');

// Clean up images from Cloudinary when auction is deleted
const cleanupAuctionImages = async (auction) => {
  try {
    if (!auction.images || auction.images.length === 0) {
      return;
    }

    const deletePromises = auction.images
      .filter(img => img.public_id)
      .map(img => deleteImage(img.public_id));

    if (deletePromises.length > 0) {
      await Promise.allSettled(deletePromises);
      console.log(`Cleaned up ${deletePromises.length} images for auction ${auction._id}`);
    }
  } catch (error) {
    console.error('Error cleaning up auction images:', error);
    // Don't throw error as this is cleanup and shouldn't fail the main operation
  }
};

// Clean up single image
const cleanupSingleImage = async (publicId) => {
  try {
    if (publicId) {
      await deleteImage(publicId);
      console.log(`Cleaned up image: ${publicId}`);
    }
  } catch (error) {
    console.error('Error cleaning up single image:', error);
  }
};

module.exports = {
  cleanupAuctionImages,
  cleanupSingleImage
};
