import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';

const DraggableImage = ({ 
  id, 
  image, 
  className = '',
  showLabel = true,
  onDoubleClick,
  ...props 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: id,
    data: {
      type: 'image',
      image: image
    }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        cursor-grab active:cursor-grabbing
        ${isDragging ? 'opacity-50 z-50' : ''}
        ${className}
      `}
      {...listeners}
      {...attributes}
      onDoubleClick={onDoubleClick}
      {...props}
    >
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <Image 
          src={image.url} 
          alt={image.name}
          width={200}
          height={96}
          className="w-full h-24 object-cover"
          draggable={false}
        />
        {showLabel && (
          <div className="p-2 text-center">
            <p className="text-xs text-gray-600 truncate">
              {image.name.replace(/\.[^/.]+$/, '')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DraggableImage;