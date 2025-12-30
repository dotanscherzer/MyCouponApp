import { useState, useRef } from 'react';
import { imagesApi } from '../api/images.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ImageUploadProps {
  groupId: string;
  couponId: string;
  onSuccess?: () => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ groupId, couponId, onSuccess }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const associateMutation = useMutation({
    mutationFn: (data: { url: string; fileName?: string; mimeType?: string; isPrimary?: boolean }) =>
      imagesApi.associateImage(groupId, couponId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupon', groupId, couponId] });
      queryClient.invalidateQueries({ queryKey: ['coupons', groupId] });
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to upload image');
      setUploading(false);
      setProgress(0);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError('');
    setUploading(true);
    setProgress(0);

    try {
      // Step 1: Initialize upload (get signed URL)
      const uploadData = await imagesApi.initUpload(groupId, couponId);

      // Step 2: Upload to Cloudinary using FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', uploadData.apiKey);
      formData.append('timestamp', uploadData.timestamp.toString());
      formData.append('signature', uploadData.signature);
      formData.append('folder', uploadData.folder);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setProgress(percentComplete);
        }
      });

      // Handle upload completion
      xhr.addEventListener('load', async () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            const imageUrl = response.secure_url || response.url;

            // Step 3: Associate image with coupon
            await associateMutation.mutateAsync({
              url: imageUrl,
              fileName: file.name,
              mimeType: file.type,
              isPrimary: false, // User can set primary later
            });
          } catch (error) {
            setError('Failed to process uploaded image');
            setUploading(false);
            setProgress(0);
          }
        } else {
          setError('Upload failed. Please try again.');
          setUploading(false);
          setProgress(0);
        }
      });

      xhr.addEventListener('error', () => {
        setError('Upload failed. Please check your connection and try again.');
        setUploading(false);
        setProgress(0);
      });

      // Upload to Cloudinary
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${uploadData.cloudName}/image/upload`);
      xhr.send(formData);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to initialize upload');
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
        style={{ display: 'none' }}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: uploading ? 'not-allowed' : 'pointer' }}
      >
        {uploading ? 'Uploading...' : 'Upload Image'}
      </button>
      {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
      {uploading && (
        <div style={{ marginTop: '10px' }}>
          <div style={{ width: '100%', height: '20px', backgroundColor: '#e0e0e0', borderRadius: '10px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: '#007bff',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>{Math.round(progress)}%</div>
        </div>
      )}
    </div>
  );
};

