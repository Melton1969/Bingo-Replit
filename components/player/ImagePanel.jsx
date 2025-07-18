import { useDroppable } from '@dnd-kit/core';
import DraggableImage from '../shared/DraggableImage';

const ImagePanel = ({ availableImages, gameName }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'image-panel',
    data: {
      type: 'image-panel'
    }
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        w-full md:w-64 bg-white border-r md:border-r border-b md:border-b-0 border-gray-200 overflow-y-auto
        ${isOver ? 'bg-blue-50' : ''}
        transition-colors duration-200
      `}
    >
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          {gameName || 'Bingo Game'}
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Drag images to the board
        </p>
        
        <div className="md:space-y-3 md:block flex space-x-3 md:space-x-0 overflow-x-auto md:overflow-x-visible">
          {availableImages.length === 0 ? (
            <div className="text-center py-8 text-gray-500 min-w-full">
              <div className="w-12 h-12 mx-auto mb-3 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-gray-300 rounded"></div>
              </div>
              <p className="text-sm">All images used!</p>
            </div>
          ) : (
            availableImages.map((image, index) => (
              <div key={`available-${image.id}-${index}`} className="md:w-full w-20 flex-shrink-0">
                <DraggableImage
                  id={`available-${image.id}-${index}`}
                  image={image}
                  className="w-full"
                  showLabel={true}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ImagePanel;