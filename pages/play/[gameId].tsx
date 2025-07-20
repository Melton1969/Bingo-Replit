import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';

import ToolBar from '../../components/player/ToolBar';
import BingoBoard from '../../components/player/BingoBoard';
import ImagePanel from '../../components/player/ImagePanel';
import DraggableImage from '../../components/shared/DraggableImage';

import { useGame } from '../../hooks/useGame';
import { useDragDrop } from '../../hooks/useDragDrop';
import { useCanvas } from '../../hooks/useCanvas';

const PlayerPage = () => {
  const router = useRouter();
  const { gameId } = router.query;
  const { gameData, loading, error } = useGame(gameId as string);
  
  const [activeItem, setActiveItem] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize drag and drop with grid size
  const {
    occupiedCells,
    cellImages,
    availableImages,
    gridDimensions,
    handleDragEnd,
    initializeImages,
    clearAllImages
  } = useDragDrop(gameData?.grid_size || '3x3');

  // Initialize canvas for drawing
  const {
    canvasRef,
    currentTool,
    currentColor,
    currentSize,
    setCurrentTool,
    setCurrentColor,
    setCurrentSize,
    clearCanvas,
    canvasProps
  } = useCanvas();

  // Initialize images when game data loads
  useEffect(() => {
    if (gameData && gameData.images && !isInitialized) {
      initializeImages(gameData.images);
      setIsInitialized(true);
    }
  }, [gameData, initializeImages, isInitialized]);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveItem(active.data.current?.image || null);
  };

  // Handle drag end
  const handleDragEndEvent = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveItem(null);
      return;
    }

    // Enhanced drag data with source information
    const enhancedActive = {
      ...active,
      data: {
        ...active.data,
        current: {
          ...active.data.current,
          sourceCell: active.id.toString().startsWith('cell-image-') 
            ? parseInt(active.id.toString().replace('cell-image-', ''))
            : undefined
        }
      }
    };

    handleDragEnd({ active: enhancedActive, over });
    setActiveItem(null);
  };

  // Handle tool changes
  const handleToolChange = (tool: string) => {
    setCurrentTool(tool);
  };

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
  };

  const handleSizeChange = (size: number) => {
    setCurrentSize(size);
  };

  const handleClearDrawing = () => {
    clearCanvas();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading game...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Game Not Found</h1>
          <p className="text-gray-600 mb-4">
            The game you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No game data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Head>
        <title>{gameData.name} - Bingo Game</title>
        <meta name="description" content={`Play ${gameData.name} bingo game`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEndEvent}
      >
        {/* Tools Bar */}
        <ToolBar
          currentTool={currentTool}
          currentColor={currentColor}
          currentSize={currentSize}
          onToolChange={handleToolChange}
          onColorChange={handleColorChange}
          onSizeChange={handleSizeChange}
          onClearDrawing={handleClearDrawing}
        />

        {/* Main Game Area */}
        <div className="flex-1 flex flex-col md:flex-row">
          {/* Left Panel - Available Images */}
          <div className="md:w-64 w-full md:h-auto h-32 md:overflow-y-auto overflow-x-auto">
            <ImagePanel
              availableImages={availableImages}
              gameName={gameData.name}
            />
          </div>

          {/* Center - Bingo Board */}
          <div className="flex-1">
            <BingoBoard
              gridSize={gameData.grid_size}
              backgroundImage={gameData.background_image}
              cellImages={cellImages}
              occupiedCells={occupiedCells}
              canvasRef={canvasRef}
              canvasProps={canvasProps}
              currentTool={currentTool}
            />
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeItem && (
            <div className="transform rotate-6 opacity-90">
              <DraggableImage
                id="drag-overlay"
                image={activeItem}
                className="w-24"
                showLabel={false}
                onDoubleClick={() => {}}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Game Info Footer */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-800">
              {gameData.name}
            </h1>
            <p className="text-sm text-gray-600">
              {gameData.grid_size} • {gameData.category}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">
                {availableImages.length}
              </span> images remaining
            </div>
            
            <button
              onClick={() => {
                clearAllImages();
                clearCanvas();
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Reset Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerPage;