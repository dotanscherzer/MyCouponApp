import { useState } from 'react';
import { Image } from '../api/images.api';
import { imagesApi } from '../api/images.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ImageGalleryProps {
  images: Image[];
  groupId: string;
  couponId: string;
  canEdit: boolean;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, groupId, couponId, canEdit }) => {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (imageId: string) => imagesApi.deleteImage(groupId, couponId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupon', groupId, couponId] });
      queryClient.invalidateQueries({ queryKey: ['coupons', groupId] });
    },
  });

  const handleDelete = (imageId: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      deleteMutation.mutate(imageId);
    }
  };

  const primaryImage = images.find((img) => img.isPrimary) || images[0];

  return (
    <div>
      {primaryImage && (
        <div style={{ marginBottom: '20px' }}>
          <img
            src={primaryImage.url}
            alt="Primary"
            style={{
              width: '100%',
              maxHeight: '400px',
              objectFit: 'contain',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
            onClick={() => setLightboxImage(primaryImage.url)}
          />
        </div>
      )}

      {images.length > 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
          {images.map((image) => (
            <div key={image.id} style={{ position: 'relative' }}>
              <img
                src={image.url}
                alt={image.fileName || 'Coupon image'}
                style={{
                  width: '100%',
                  height: '100px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  border: image.isPrimary ? '3px solid #28a745' : '1px solid #ccc',
                }}
                onClick={() => setLightboxImage(image.url)}
              />
              {canEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(image.id);
                  }}
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    backgroundColor: 'rgba(220, 53, 69, 0.8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    lineHeight: '1',
                  }}
                  disabled={deleteMutation.isPending}
                >
                  ×
                </button>
              )}
              {image.isPrimary && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '5px',
                    left: '5px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                  }}
                >
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {lightboxImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            cursor: 'pointer',
          }}
          onClick={() => setLightboxImage(null)}
        >
          <img
            src={lightboxImage}
            alt="Full size"
            style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightboxImage(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              cursor: 'pointer',
              fontSize: '24px',
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

