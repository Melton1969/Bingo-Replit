import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import DraggableImage from '../shared/DraggableImage';

const BingoBoard = ({ 
  gridSize, 
  backgroundImage, 
  cellImages, 
  occupiedCells,
  canvasRef,
  canvasProps,
  currentTool
}) => {
  const getGridDimensions = (size) => {
    const [cols, rows] = size.split('x').map(Number);
    return { cols, rows, total: cols * rows };
  };

  const { cols, rows, total } = getGridDimensions(gridSize);

  const BingoCell = ({ index, image }) => {
    const { isOver, setNodeRef } = useDroppable({
      id: `cell-${index}`,
      data: {
        type: 'cell',
        index: index
      }
    });

    const isOccupied = occupiedCells.has(index);

    return (
      <div
        ref={setNodeRef}
        className={`
          bingo-cell
          ${isOccupied ? 'occupied' : ''}
          ${isOver ? 'drag-over' : ''}
        `}
      >
        {image && (
          <DraggableImage
            id={`cell-image-${index}`}
            image={image}
            className="w-full h-full"
            showLabel={false}
            {...{ 
              'data-source-cell': index,
              'data-type': 'cell-image'
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div 
        className="relative max-w-2xl w-full aspect-square"
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Background overlay for better visibility */}
        {backgroundImage && (
          <div className="absolute inset-0 bg-white bg-opacity-20 backdrop-blur-sm" />
        )}
        
        {/* Bingo Grid */}
        <div
          className="bingo-grid relative z-10 w-full h-full"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`
          }}
        >
          {Array.from({ length: total }).map((_, index) => {
            const image = cellImages.get(index);
            return (
              <BingoCell
                key={index}
                index={index}
                image={image}
              />
            );
          })}
        </div>

        {/* Drawing Canvas */}
        <canvas
          ref={canvasRef}
          className={`
            drawing-canvas absolute top-0 left-0 w-full h-full
            ${currentTool !== 'hand' ? 'active' : ''}
          `}
          style={{
            width: '100%',
            height: '100%',
            pointerEvents: currentTool !== 'hand' ? 'all' : 'none'
          }}
          {...canvasProps}
        />
      </div>
    </div>
  );
};

export default BingoBoard;