import { Request, Response } from 'express';
import { Coupon } from '../models/Coupon.model';
import { generateUploadSignature, deleteImage } from '../services/image.service';
import { Types } from 'mongoose';

export const initUpload = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId, couponId } = req.params;
    
    // Verify coupon exists and user has permission (already checked by middleware)
    const coupon = await Coupon.findOne({
      _id: new Types.ObjectId(couponId),
      groupId: new Types.ObjectId(groupId),
    });

    if (!coupon) {
      res.status(404).json({ error: 'Coupon not found' });
      return;
    }

    const folder = `coupons/${groupId}/${couponId}`;
    const signatureData = await generateUploadSignature(folder);

    res.json({
      ...signatureData,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder,
    });
  } catch (error) {
    console.error('Init upload error:', error);
    res.status(500).json({ error: 'Failed to initialize upload' });
  }
};

export const associateImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId, couponId } = req.params;
    const { url, fileName, mimeType, isPrimary } = req.body;

    if (!url) {
      res.status(400).json({ error: 'Image URL is required' });
      return;
    }

    const coupon = await Coupon.findOne({
      _id: new Types.ObjectId(couponId),
      groupId: new Types.ObjectId(groupId),
    });

    if (!coupon) {
      res.status(404).json({ error: 'Coupon not found' });
      return;
    }

    // If setting as primary, unset other primary images
    if (isPrimary) {
      coupon.images.forEach(img => {
        img.isPrimary = false;
      });
    }

    // Add new image
    coupon.images.push({
      url,
      fileName,
      mimeType,
      isPrimary: isPrimary || false,
      createdAt: new Date(),
    });

    // If no primary image exists, set this one as primary
    if (!coupon.images.some(img => img.isPrimary)) {
      coupon.images[coupon.images.length - 1].isPrimary = true;
    }

    await coupon.save();

    const addedImage = coupon.images[coupon.images.length - 1];
    res.status(201).json({
      id: addedImage._id,
      url: addedImage.url,
      fileName: addedImage.fileName,
      mimeType: addedImage.mimeType,
      isPrimary: addedImage.isPrimary,
      createdAt: addedImage.createdAt,
    });
  } catch (error) {
    console.error('Associate image error:', error);
    res.status(500).json({ error: 'Failed to associate image' });
  }
};

export const deleteImageController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId, couponId, imageId } = req.params;

    const coupon = await Coupon.findOne({
      _id: new Types.ObjectId(couponId),
      groupId: new Types.ObjectId(groupId),
    });

    if (!coupon) {
      res.status(404).json({ error: 'Coupon not found' });
      return;
    }

    const imageIndex = coupon.images.findIndex(
      img => img._id.toString() === imageId
    );

    if (imageIndex === -1) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }

    const image = coupon.images[imageIndex];

    // Extract public_id from Cloudinary URL if possible
    // Cloudinary URLs format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
    try {
      const urlParts = image.url.split('/upload/');
      if (urlParts.length > 1) {
        const pathParts = urlParts[1].split('/');
        const publicIdWithExtension = pathParts[pathParts.length - 1];
        const publicId = publicIdWithExtension.split('.')[0];
        await deleteImage(publicId);
      }
    } catch (deleteError) {
      console.error('Error deleting from Cloudinary, continuing:', deleteError);
      // Continue even if Cloudinary deletion fails
    }

    // Remove image from coupon
    coupon.images.splice(imageIndex, 1);
    await coupon.save();

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
};
