import { cloudinary } from '../config/cloudinary.config';
import { v2 } from 'cloudinary';

export async function generateUploadSignature(folder?: string): Promise<{
  signature: string;
  timestamp: number;
  folder?: string;
}> {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const params: any = {
    timestamp,
  };

  if (folder) {
    params.folder = folder;
  }

  const signature = v2.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET || ''
  );

  return {
    signature,
    timestamp,
    folder,
  };
}

export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
}
