import { useState } from 'react';
import { Hand, Pencil, Eraser, Trash2 } from 'lucide-react';

const ToolBar = ({ 
  currentTool, 
  currentColor, 
  currentSize, 
  onToolChange, 
  onColorChange, 
  onSizeChange, 
  onClearDrawing 
}) => {
  const tools = [
    { id: 'hand', icon: Hand, label: 'Hand', description: 'Drag images' },
    { id: 'pencil', icon: Pencil, label: 'Pencil', description: 'Draw on board' },
    { id: 'eraser', icon: Eraser, label: 'Eraser', description: 'Erase drawings' },
  ];

  const colors = [
    { id: 'red', color: '#EF4444', name: 'Red' },
    { id: 'blue', color: '#3B82F6', name: 'Blue' },
    { id: 'green', color: '#10B981', name: 'Green' },
    { id: 'black', color: '#1F2937', name: 'Black' },
    { id: 'yellow', color: '#F59E0B', name: 'Yellow' },
  ];

  return (
    <div className="bg-white border-b border-gray-200 p-2 sm:p-4 shadow-sm">
      <div className="flex items-center justify-center space-x-2 sm:space-x-4 lg:space-x-8 max-w-6xl mx-auto flex-wrap gap-2 sm:gap-0">
        {/* Tools */}
        <div className="flex items-center space-x-2">
          {tools.map(tool => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => onToolChange(tool.id)}
                className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 ${
                  currentTool === tool.id
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600'
                }`}
                title={tool.description}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>

        {/* Color Picker */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Color:</span>
          <div className="flex items-center space-x-1">
            {colors.map(color => (
              <button
                key={color.id}
                onClick={() => onColorChange(color.color)}
                className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                  currentColor === color.color
                    ? 'border-gray-800 scale-110'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color.color }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Size Slider */}
        <div className="flex items-center space-x-3">
          <label className="text-sm font-medium text-gray-700">Size:</label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="1"
              max="20"
              value={currentSize}
              onChange={(e) => onSizeChange(parseInt(e.target.value))}
              className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(currentSize / 20) * 100}%, #E5E7EB ${(currentSize / 20) * 100}%, #E5E7EB 100%)`
              }}
            />
            <span className="text-sm font-medium text-gray-600 min-w-[2rem] text-center">
              {currentSize}px
            </span>
          </div>
        </div>

        {/* Clear Drawing */}
        <button
          onClick={onClearDrawing}
          className="p-3 rounded-lg border-2 border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600 transition-all duration-200"
          title="Clear all drawings"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ToolBar;