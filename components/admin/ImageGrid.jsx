import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Check, X, Image as ImageIcon } from 'lucide-react';

const ImageGrid = ({ 
  folderId, 
  folderPath = '', 
  selectedImages = [], 
  onImageToggle,
  selectionMode = true 
}) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadImages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/folders/${folderId}/images`);
      if (!response.ok) {
        throw new Error('Failed to load images');
      }
      
      const data = await response.json();
      setImages(data);
      
    } catch (err) {
      console.error('Error loading images:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [folderId]);

  useEffect(() => {
    if (folderId) {
      loadImages();
    } else {
      setImages([]);
    }
  }, [folderId, loadImages]);

  const handleImageClick = (image) => {
    if (selectionMode && onImageToggle) {
      onImageToggle(image);
    }
  };

  const isImageSelected = (imageId) => {
    return selectedImages.some(img => img.id === imageId);
  };

  const getImageName = (name) => {
    // Remove file extension for display
    return name.replace(/\.[^/.]+$/, '');
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="loading-spinner mx-auto"></div>
        <p className="text-gray-500 mt-2">Loading images...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>Error loading images: {error}</p>
        <button 
          onClick={loadImages}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!folderId) {
    return (
      <div className="p-8 text-center text-gray-500">
        <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>Select a folder to view images</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-800 mb-1">
          {folderPath || 'Selected Folder'}
        </h3>
        <p className="text-sm text-gray-600">
          {images.length} image{images.length !== 1 ? 's' : ''}
          {selectionMode && selectedImages.length > 0 && (
            <span className="ml-2 text-blue-600">
              ({selectedImages.filter(img => 
                images.some(folderImg => folderImg.id === img.id)
              ).length} selected)
            </span>
          )}
        </p>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>No images in this folder</p>
        </div>
      ) : (
        <div className="image-grid">
          {images.map(image => {
            const isSelected = isImageSelected(image.id);
            
            return (
              <div
                key={image.id}
                className={`image-item relative group cursor-pointer transition-all duration-200 ${
                  isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                }`}
                onClick={() => handleImageClick(image)}
              >
                <div className="relative bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Image */}
                  <div className="aspect-square overflow-hidden">
                    <Image
                      src={image.url}
                      alt={image.name}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  
                  {/* Image name */}
                  <div className="p-2 text-center">
                    <p className="text-xs text-gray-600 truncate font-medium">
                      {getImageName(image.name)}
                    </p>
                  </div>
                  
                  {/* Selection indicator */}
                  {selectionMode && (
                    <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                      isSelected
                        ? 'bg-blue-500 border-blue-500'
                        : 'bg-white border-gray-300 group-hover:border-gray-400'
                    }`}>
                      {isSelected && (
                        <Check className="w-4 h-4 text-white m-0.5" />
                      )}
                    </div>
                  )}
                  
                  {/* Hover overlay */}
                  <div className={`absolute inset-0 transition-opacity duration-200 ${
                    selectionMode 
                      ? 'bg-black bg-opacity-0 group-hover:bg-opacity-10' 
                      : 'bg-black bg-opacity-0 group-hover:bg-opacity-5'
                  }`} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ImageGrid;