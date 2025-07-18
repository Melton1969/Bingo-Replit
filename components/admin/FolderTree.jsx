import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Edit2, Image, Settings } from 'lucide-react';
import FolderManagementModal from './FolderManagementModal';

const FolderTree = ({ 
  selectedFolderId, 
  onFolderSelect, 
  onEditFolder 
}) => {
  const [folders, setFolders] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [folderCounts, setFolderCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [managementModalOpen, setManagementModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/folders');
      if (!response.ok) {
        throw new Error('Failed to load folders');
      }
      
      const data = await response.json();
      setFolders(data);
      
      // Load image counts for each folder
      const counts = {};
      for (const folder of data) {
        try {
          const imagesResponse = await fetch(`/api/folders/${folder.id}/images`);
          if (imagesResponse.ok) {
            const images = await imagesResponse.json();
            counts[folder.id] = images.length;
          }
        } catch (err) {
          console.error('Error loading images for folder:', folder.id, err);
          counts[folder.id] = 0;
        }
      }
      setFolderCounts(counts);
      
    } catch (err) {
      console.error('Error loading folders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const buildFolderTree = (folders, parentId = null) => {
    return folders
      .filter(folder => folder.parent_id === parentId)
      .map(folder => ({
        ...folder,
        children: buildFolderTree(folders, folder.id)
      }));
  };

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleFolderClick = (folder) => {
    // Auto-expand when selecting a folder
    if (folder.children?.length > 0) {
      setExpandedFolders(prev => new Set([...prev, folder.id]));
    }
    onFolderSelect(folder);
  };

  const renderFolderNode = (folder, depth = 0) => {
    const hasChildren = folder.children && folder.children.length > 0;
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolderId === folder.id;
    const imageCount = folderCounts[folder.id] || 0;

    return (
      <div key={folder.id} className="folder-tree">
        <div 
          className={`folder-item flex items-center space-x-2 py-2 px-3 rounded-md transition-colors ${
            isSelected 
              ? 'bg-blue-100 border-blue-300 text-blue-800' 
              : 'hover:bg-gray-50 border-transparent'
          }`}
          style={{ paddingLeft: `${depth * 20 + 12}px` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleFolder(folder.id)}
              className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
          ) : (
            <div className="w-6 h-6 flex-shrink-0" />
          )}
          
          <button
            onClick={() => handleFolderClick(folder)}
            className="flex items-center space-x-2 flex-1 text-left min-w-0"
          >
            {hasChildren && isExpanded ? (
              <FolderOpen className="w-4 h-4 text-blue-500 flex-shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-gray-500 flex-shrink-0" />
            )}
            
            <span className="text-sm font-medium text-gray-700 truncate">
              {folder.name}
            </span>
            
            {imageCount > 0 && (
              <div className="flex items-center space-x-1 text-xs text-gray-500 flex-shrink-0">
                <Image className="w-3 h-3" />
                <span>({imageCount})</span>
              </div>
            )}
          </button>
          
          {onEditFolder && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFolder(folder);
                setManagementModalOpen(true);
              }}
              className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-colors opacity-0 group-hover:opacity-100"
              title="Manage folder"
            >
              <Settings className="w-3 h-3 text-gray-500" />
            </button>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-2">
            {folder.children.map(child => renderFolderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="loading-spinner mx-auto"></div>
        <p className="text-gray-500 mt-2 text-sm">Loading folders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        <p className="text-sm">Error loading folders: {error}</p>
        <button 
          onClick={loadFolders}
          className="mt-2 text-xs underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  const folderTree = buildFolderTree(folders);

  return (
    <div className="folder-tree-container">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-3 mb-2">
        <h3 className="font-semibold text-gray-800">Vocabulary Folders</h3>
        {onEditFolder && (
          <button
            onClick={() => {
              setSelectedFolder(null);
              setManagementModalOpen(true);
            }}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Upload Images
          </button>
        )}
      </div>
      
      <div className="px-2 pb-4 space-y-1 max-h-96 overflow-y-auto">
        {folderTree.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Folder className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No folders found</p>
          </div>
        ) : (
          folderTree.map(folder => renderFolderNode(folder))
        )}
      </div>
      
      {/* Folder Management Modal */}
      <FolderManagementModal
        isOpen={managementModalOpen}
        onClose={() => {
          setManagementModalOpen(false);
          setSelectedFolder(null);
        }}
        folder={selectedFolder}
        onRefresh={() => {
          loadFolders();
        }}
      />
    </div>
  );
};

export default FolderTree;