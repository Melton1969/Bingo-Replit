import { useState } from 'react';

export const useDragDrop = (gridSize) => {
  const [occupiedCells, setOccupiedCells] = useState(new Set());
  const [cellImages, setCellImages] = useState(new Map());
  const [availableImages, setAvailableImages] = useState([]);

  const getGridDimensions = (size) => {
    const [cols, rows] = size.split('x').map(Number);
    return { cols, rows, total: cols * rows };
  };

  const { cols, rows, total } = getGridDimensions(gridSize);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) return;

    const draggedImage = active.data.current.image;
    const targetCellId = over.id;
    
    // Handle dropping on grid cell
    if (targetCellId.startsWith('cell-')) {
      const cellIndex = parseInt(targetCellId.split('-')[1]);
      
      // Check if cell is already occupied
      if (occupiedCells.has(cellIndex)) return;
      
      // Remove image from available images
      setAvailableImages(prev => 
        prev.filter(img => img.id !== draggedImage.id)
      );
      
      // Add image to cell
      setCellImages(prev => new Map(prev).set(cellIndex, draggedImage));
      setOccupiedCells(prev => new Set(prev).add(cellIndex));
    }
    
    // Handle dropping back to image panel
    else if (targetCellId === 'image-panel') {
      const sourceCell = active.data.current.sourceCell;
      if (sourceCell !== undefined) {
        // Remove from grid
        setCellImages(prev => {
          const newMap = new Map(prev);
          newMap.delete(sourceCell);
          return newMap;
        });
        setOccupiedCells(prev => {
          const newSet = new Set(prev);
          newSet.delete(sourceCell);
          return newSet;
        });
        
        // Add back to available images
        setAvailableImages(prev => [...prev, draggedImage]);
      }
    }
  };

  const initializeImages = (images) => {
    setAvailableImages(images);
    setCellImages(new Map());
    setOccupiedCells(new Set());
  };

  const clearAllImages = () => {
    const allImages = [...availableImages];
    cellImages.forEach(image => allImages.push(image));
    
    setAvailableImages(allImages);
    setCellImages(new Map());
    setOccupiedCells(new Set());
  };

  return {
    occupiedCells,
    cellImages,
    availableImages,
    gridDimensions: { cols, rows, total },
    handleDragEnd,
    initializeImages,
    clearAllImages
  };
};