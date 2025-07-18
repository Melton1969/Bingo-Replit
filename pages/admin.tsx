import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Copy, Edit, Trash2, ExternalLink, Settings } from 'lucide-react';
import Button from '../components/shared/Button';
import FolderTree from '../components/admin/FolderTree';
import ImageGrid from '../components/admin/ImageGrid';
import SelectedImages from '../components/admin/SelectedImages';
import SaveGameModal from '../components/admin/SaveGameModal';
import { useGames } from '../hooks/useGame';

const AdminPage = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { games, loading, error, deleteGame, createGame, refreshGames } = useGames(categoryFilter);
  
  // Game creation state
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null);

  const handleDeleteGame = async (gameId) => {
    if (confirm('Are you sure you want to delete this game?')) {
      try {
        await deleteGame(gameId);
        if (selectedGame?.id === gameId) {
          setSelectedGame(null);
        }
      } catch (error) {
        alert('Error deleting game: ' + error.message);
      }
    }
  };

  const copyGameLink = (shortId) => {
    const link = `${window.location.origin}/play/${shortId}`;
    navigator.clipboard.writeText(link);
    alert('Game link copied to clipboard!');
  };

  const getGridSize = (gridSize) => {
    const [cols, rows] = gridSize.split('x').map(Number);
    return { cols, rows };
  };

  const categories = [...new Set(games.map(game => game.category))];

  // Game creation handlers
  const handleFolderSelect = (folder) => {
    setSelectedFolder(folder);
  };

  const handleImageToggle = (image) => {
    setSelectedImages(prev => {
      const exists = prev.find(img => img.id === image.id);
      if (exists) {
        return prev.filter(img => img.id !== image.id);
      } else {
        return [...prev, image];
      }
    });
  };

  const handleRemoveImage = (image, index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearAllImages = () => {
    setSelectedImages([]);
  };

  const handleSaveGame = async (gameData) => {
    try {
      await createGame(gameData);
      setSelectedImages([]);
      setShowSaveModal(false);
      alert('Game created successfully!');
    } catch (error) {
      throw new Error('Failed to create game: ' + error.message);
    }
  };

  const handleEditGame = (game) => {
    setEditingGame(game);
    setShowSaveModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Bingo Admin - Manage Games</title>
        <meta name="description" content="Manage educational bingo games" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Bingo Game Administration
          </h1>
          <p className="text-gray-600">
            Manage your educational vocabulary games
          </p>
        </div>

        {/* Saved Games Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-center text-blue-600">
            Saved Games
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Games List */}
            <div className="lg:col-span-1">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Category:
                </label>
                <select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {loading && (
                  <div className="text-center py-4">
                    <div className="loading-spinner mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading games...</p>
                  </div>
                )}
                
                {error && (
                  <div className="text-center py-4 text-red-600">
                    <p>Error loading games: {error}</p>
                  </div>
                )}
                
                {!loading && !error && games.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <p>No games found. Create your first game!</p>
                  </div>
                )}
                
                {games.map(game => (
                  <div
                    key={game.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedGame?.id === game.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedGame(game)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-800">{game.name}</h3>
                        <p className="text-sm text-gray-500">{game.category}</p>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyGameLink(game.short_id);
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Copy game link"
                        >
                          <Copy className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/play/${game.short_id}`, '_blank');
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Open game"
                        >
                          <ExternalLink className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditGame(game);
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Edit game"
                        >
                          <Edit className="w-4 h-4 text-blue-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Middle Column - Game Preview */}
            <div className="lg:col-span-1">
              <h3 className="font-medium text-gray-700 mb-4">Game Preview</h3>
              
              {selectedGame ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <h4 className="font-semibold text-lg">{selectedGame.name}</h4>
                    <p className="text-sm text-gray-500">
                      Game ID: {selectedGame.short_id}
                    </p>
                  </div>
                  
                  {/* Mock grid preview */}
                  <div 
                    className="bingo-grid mx-auto w-48 h-48"
                    style={{
                      gridTemplateColumns: `repeat(${getGridSize(selectedGame.grid_size).cols}, 1fr)`,
                      gridTemplateRows: `repeat(${getGridSize(selectedGame.grid_size).rows}, 1fr)`
                    }}
                  >
                    {Array.from({ length: getGridSize(selectedGame.grid_size).cols * getGridSize(selectedGame.grid_size).rows }).map((_, i) => (
                      <div key={i} className="bingo-cell">
                        <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => handleDeleteGame(selectedGame.id)}
                      className="flex-1"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handleEditGame(selectedGame)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Select a game to preview</p>
                </div>
              )}
            </div>

            {/* Right Column - Game Info */}
            <div className="lg:col-span-1">
              <h3 className="font-medium text-gray-700 mb-4">Game Information</h3>
              
              {selectedGame ? (
                <div className="space-y-4">
                  {selectedGame.background_image && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-600 mb-2">Background</h4>
                      <img 
                        src={selectedGame.background_image} 
                        alt="Background" 
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 mb-2">Grid Size</h4>
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedGame.grid_size}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 mb-2">Category</h4>
                    <p className="text-lg">{selectedGame.category}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 mb-2">Game Link</h4>
                    <div className="flex">
                      <input 
                        type="text" 
                        value={`/play/${selectedGame.short_id}`}
                        readOnly
                        className="flex-1 p-2 text-sm bg-gray-50 border border-gray-300 rounded-l-md"
                      />
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => copyGameLink(selectedGame.short_id)}
                        className="rounded-l-none"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Select a game to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Game Creation Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6 text-center text-green-600">
            Save / Edit Game
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Folder Tree */}
            <div className="lg:col-span-1">
              <FolderTree
                selectedFolderId={selectedFolder?.id}
                onFolderSelect={handleFolderSelect}
                onEditFolder={() => {}}
              />
            </div>

            {/* Middle Column - Selectable Images */}
            <div className="lg:col-span-1">
              <ImageGrid
                folderId={selectedFolder?.id}
                folderPath={selectedFolder?.path}
                selectedImages={selectedImages}
                onImageToggle={handleImageToggle}
                selectionMode={true}
              />
            </div>

            {/* Right Column - Selected Images */}
            <div className="lg:col-span-1">
              <SelectedImages
                selectedImages={selectedImages}
                onRemoveImage={handleRemoveImage}
                onClearAll={handleClearAllImages}
                onSaveGame={() => setShowSaveModal(true)}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Save Game Modal */}
      <SaveGameModal
        isOpen={showSaveModal}
        onClose={() => {
          setShowSaveModal(false);
          setEditingGame(null);
        }}
        onSave={handleSaveGame}
        selectedImages={selectedImages}
        editingGame={editingGame}
      />
    </div>
  );
};

export default AdminPage;