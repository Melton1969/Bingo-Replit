import { useState, useEffect } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';

const SaveGameModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  selectedImages = [],
  editingGame = null 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    gridSize: '3x3',
    backgroundImage: '',
    category: ''
  });
  const [backgrounds, setBackgrounds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadBackgrounds();
      loadCategories();
      
      // If editing, populate form
      if (editingGame) {
        setFormData({
          name: editingGame.name || '',
          gridSize: editingGame.grid_size || '3x3',
          backgroundImage: editingGame.background_image || '',
          category: editingGame.category || ''
        });
      } else {
        setFormData({
          name: '',
          gridSize: '3x3',
          backgroundImage: '',
          category: ''
        });
      }
      setError('');
    }
  }, [isOpen, editingGame]);

  const loadBackgrounds = async () => {
    try {
      const response = await fetch('/api/backgrounds');
      if (response.ok) {
        const data = await response.json();
        setBackgrounds(data);
      }
    } catch (err) {
      console.error('Error loading backgrounds:', err);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/games');
      if (response.ok) {
        const games = await response.json();
        const uniqueCategories = [...new Set(games.map(game => game.category))];
        setCategories(uniqueCategories);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const getGridDimensions = (size) => {
    const [cols, rows] = size.split('x').map(Number);
    return cols * rows;
  };

  const getRequiredImages = () => {
    return getGridDimensions(formData.gridSize);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Game name is required');
      return false;
    }
    
    if (!formData.category.trim()) {
      setError('Category is required');
      return false;
    }
    
    const requiredImages = getRequiredImages();
    if (selectedImages.length !== requiredImages) {
      setError(`You need exactly ${requiredImages} images for a ${formData.gridSize} grid`);
      return false;
    }
    
    // Check for valid characters in name
    if (!/^[A-Za-z0-9\s\-]+$/.test(formData.name)) {
      setError('Game name can only contain letters, numbers, spaces, and hyphens');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const gameData = {
        ...formData,
        image_ids: selectedImages.map(img => img.id)
      };
      
      await onSave(gameData);
      
      // Reset form
      setFormData({
        name: '',
        gridSize: '3x3',
        backgroundImage: '',
        category: ''
      });
      
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save game');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const selectedBackground = backgrounds.find(bg => bg.url === formData.backgroundImage);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingGame ? 'Edit Game' : 'Save New Game'}
      size="medium"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Game Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Game Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter game name"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Grid Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Grid Size *
          </label>
          <select
            value={formData.gridSize}
            onChange={(e) => handleInputChange('gridSize', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="3x3">3x3 (9 images)</option>
            <option value="4x4">4x4 (16 images)</option>
            <option value="5x5">5x5 (25 images)</option>
            <option value="6x6">6x6 (36 images)</option>
          </select>
        </div>

        {/* Background Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Background Image
          </label>
          <select
            value={formData.backgroundImage}
            onChange={(e) => handleInputChange('backgroundImage', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">No background</option>
            {backgrounds.map(bg => (
              <option key={bg.id} value={bg.url}>
                {bg.name}
              </option>
            ))}
          </select>
          
          {selectedBackground && (
            <div className="mt-3">
              <img
                src={selectedBackground.url}
                alt={selectedBackground.name}
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <div className="flex space-x-2">
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select or type category</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              placeholder="Or type new category"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Selected Images Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">Selected Images</h4>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedImages.length} / {getRequiredImages()} required
            </span>
            <span className={`text-sm font-medium ${
              selectedImages.length === getRequiredImages() 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {selectedImages.length === getRequiredImages() 
                ? '✓ Perfect!' 
                : `Need ${getRequiredImages() - selectedImages.length} more`
              }
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Saving...' : editingGame ? 'Update Game' : 'Save Game'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SaveGameModal;