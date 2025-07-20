import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { 
  FolderPlus, 
  Upload, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  AlertTriangle,
  Image as ImageIcon,
  Download
} from 'lucide-react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';

const FolderManagementModal = ({ 
  isOpen, 
  onClose, 
  folder = null,
  onRefresh 
}) => {
  const [images, setImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingImageId, setEditingImageId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && folder) {
      loadImages();
    }
  }, [isOpen, folder, loadImages]);

  const loadImages = useCallback(async () => {
    if (!folder) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/folders/${folder.id}/images`);
      if (response.ok) {
        const data = await response.json();
        setImages(data);
      }
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
  }, [folder]);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      uploadImages(files);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    
    const files = Array.from(event.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      uploadImages(files);
    }
  };

  const uploadImages = async (files) => {
    setUploading(true);
    
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });
      formData.append('folderId', folder.id);
      formData.append('folderPath', folder.path);

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (response.ok) {
        if (result.errors.length > 0) {
          alert(`Upload completed with errors:\n${result.errors.map(e => `${e.filename}: ${e.error}`).join('\n')}`);
        } else {
          alert(`Successfully uploaded ${result.uploaded.length} images`);
        }
        await loadImages();
        onRefresh && onRefresh();
      } else {
        alert('Upload failed: ' + result.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleImageSelect = (imageId) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    setSelectedImages(new Set(images.map(img => img.id)));
  };

  const handleDeselectAll = () => {
    setSelectedImages(new Set());
  };

  const handleDeleteSelected = async () => {
    if (selectedImages.size === 0) return;
    
    const imageIds = Array.from(selectedImages);
    const confirmMessage = `Are you sure you want to delete ${imageIds.length} selected images? This action cannot be undone.`;
    
    if (!confirm(confirmMessage)) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/images/batch', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageIds })
      });

      const result = await response.json();
      
      if (response.ok) {
        if (result.errors.length > 0) {
          alert(`Delete completed with errors:\n${result.errors.map(e => `${e.imageId}: ${e.error}`).join('\n')}`);
        } else {
          alert(`Successfully deleted ${result.deleted.length} images`);
        }
        await loadImages();
        setSelectedImages(new Set());
        onRefresh && onRefresh();
      } else {
        alert('Delete failed: ' + result.error);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Delete failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRenameImage = async (imageId) => {
    const newName = editingName.trim();
    if (!newName) return;
    
    try {
      const response = await fetch(`/api/images/${imageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName })
      });

      if (response.ok) {
        await loadImages();
        setEditingImageId(null);
        setEditingName('');
      } else {
        const result = await response.json();
        alert('Rename failed: ' + result.error);
      }
    } catch (error) {
      console.error('Rename error:', error);
      alert('Rename failed');
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    try {
      const response = await fetch(`/api/images/${imageId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadImages();
        onRefresh && onRefresh();
      } else {
        const result = await response.json();
        alert('Delete failed: ' + result.error);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Delete failed');
    }
  };

  const startEditing = (image) => {
    setEditingImageId(image.id);
    setEditingName(image.name.replace(/\.[^/.]+$/, '')); // Remove extension
  };

  const cancelEditing = () => {
    setEditingImageId(null);
    setEditingName('');
  };

  if (!folder) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Manage Folder: ${folder.name}`}
      size="xlarge"
    >
      <div className="space-y-6">
        {/* Folder Actions */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-800">{folder.path}</h3>
            <p className="text-sm text-gray-600">
              {images.length} image{images.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="small"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="w-4 h-4 mr-1" />
              {uploading ? 'Uploading...' : 'Upload Images'}
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              {selectedImages.size} selected
            </span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="small"
                onClick={handleSelectAll}
                disabled={loading}
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="small"
                onClick={handleDeselectAll}
                disabled={loading || selectedImages.size === 0}
              >
                Deselect All
              </Button>
            </div>
          </div>
          
          <Button
            variant="danger"
            size="small"
            onClick={handleDeleteSelected}
            disabled={loading || selectedImages.size === 0}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete Selected
          </Button>
        </div>

        {/* Upload Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            multiple
            className="hidden"
          />
          
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-2">
            Drag and drop images here or click to select
          </p>
          <p className="text-sm text-gray-500">
            Supports JPG, PNG, GIF up to 5MB each
          </p>
        </div>

        {/* Images Grid */}
        <div className="min-h-96 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="loading-spinner"></div>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No images in this folder</p>
              <p className="text-sm mt-2">Upload some images to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map(image => (
                <div
                  key={image.id}
                  className={`relative group bg-white rounded-lg shadow-sm border-2 transition-all ${
                    selectedImages.has(image.id) 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Selection checkbox */}
                  <button
                    onClick={() => handleImageSelect(image.id)}
                    className={`absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      selectedImages.has(image.id)
                        ? 'bg-blue-500 border-blue-500'
                        : 'bg-white border-gray-300 group-hover:border-gray-400'
                    }`}
                  >
                    {selectedImages.has(image.id) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </button>

                  {/* Image */}
                  <div className="aspect-square overflow-hidden rounded-t-lg">
                    <Image
                      src={image.url}
                      alt={image.name}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Image name */}
                  <div className="p-2">
                    {editingImageId === image.id ? (
                      <div className="flex items-center space-x-1">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 text-xs border rounded px-1 py-0.5"
                          onKeyPress={(e) => e.key === 'Enter' && handleRenameImage(image.id)}
                          autoFocus
                        />
                        <button
                          onClick={() => handleRenameImage(image.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="text-gray-600 hover:text-gray-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-600 truncate font-medium">
                        {image.name.replace(/\.[^/.]+$/, '')}
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEditing(image)}
                      className="w-6 h-6 bg-white rounded-full shadow-sm border flex items-center justify-center hover:bg-gray-50"
                      title="Rename"
                    >
                      <Edit2 className="w-3 h-3 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      className="w-6 h-6 bg-white rounded-full shadow-sm border flex items-center justify-center hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default FolderManagementModal;