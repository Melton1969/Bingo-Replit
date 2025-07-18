import { X, Trash2 } from 'lucide-react';
import Button from '../shared/Button';

const SelectedImages = ({ 
  selectedImages = [], 
  onRemoveImage, 
  onClearAll, 
  onSaveGame,
  maxImages = null 
}) => {
  const getImageName = (name) => {
    return name.replace(/\.[^/.]+$/, '');
  };

  const getRemainingSlots = () => {
    if (!maxImages) return null;
    return maxImages - selectedImages.length;
  };

  const canSave = selectedImages.length > 0 && (!maxImages || selectedImages.length <= maxImages);

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-800">
            Selected Images ({selectedImages.length})
          </h3>
          {maxImages && (
            <p className="text-sm text-gray-600">
              {getRemainingSlots() > 0 
                ? `${getRemainingSlots()} more needed` 
                : getRemainingSlots() === 0 
                  ? 'Perfect! Ready to save'
                  : `${Math.abs(getRemainingSlots())} too many`
              }
            </p>
          )}
        </div>
        
        {selectedImages.length > 0 && (
          <Button
            variant="outline"
            size="small"
            onClick={onClearAll}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {selectedImages.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="w-16 h-16 mx-auto mb-3 bg-gray-200 rounded-lg flex items-center justify-center">
            <div className="w-8 h-8 bg-gray-300 rounded"></div>
          </div>
          <p className="text-sm">No images selected</p>
          <p className="text-xs text-gray-400 mt-1">
            Click images from folders to add them
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4 max-h-64 overflow-y-auto">
            {selectedImages.map((image, index) => (
              <div
                key={`${image.id}-${index}`}
                className="relative group bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                
                <div className="p-2 text-center">
                  <p className="text-xs text-gray-600 truncate">
                    {getImageName(image.name)}
                  </p>
                </div>
                
                {/* Remove button */}
                <button
                  onClick={() => onRemoveImage(image, index)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 flex items-center justify-center"
                  title="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
                
                {/* Position indicator */}
                <div className="absolute top-1 left-1 w-5 h-5 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center font-medium">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
          
          {/* Save button */}
          {onSaveGame && (
            <div className="border-t pt-4">
              <Button
                variant={canSave ? "success" : "outline"}
                size="large"
                onClick={onSaveGame}
                disabled={!canSave}
                className="w-full"
              >
                {!canSave && maxImages && selectedImages.length > maxImages
                  ? `Remove ${Math.abs(getRemainingSlots())} images to save`
                  : !canSave && maxImages && selectedImages.length < maxImages
                    ? `Select ${getRemainingSlots()} more images`
                    : 'Save Game'
                }
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SelectedImages;