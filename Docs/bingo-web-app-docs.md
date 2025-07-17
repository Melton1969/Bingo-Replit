# Bingo Web App - Product Requirements & Design Documentation

## 1. Product Overview

### 1.1 Executive Summary
The Bingo Web App is an educational tool designed for teachers to create, manage, and share interactive vocabulary-based bingo games with students. The application consists of two main components:
- **Player Page**: Where students play bingo games using drag-and-drop functionality
- **Admin Page**: Where teachers create, edit, and manage bingo games

### 1.2 Technical Stack
- **Frontend Framework**: React.js with Next.js
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage Bucket
- **Deployment**: Vercel and Replit
- **Version Control**: GitHub (https://github.com/Melton1969/Bingo-Replit)
- **Database URL**: https://klyxwfqsqzcwfvygyppd.supabase.co

### 1.3 Core Features
- Drag-and-drop interface for game creation and gameplay
- Drawing tools with adjustable pen/eraser size
- Full CRUD operations for folders and images
- Batch operations support for efficient management
- Storage bucket and database synchronization
- Multi-device support (mouse and touch)
- Real-time game link generation and sharing

## 2. Database Schema

### 2.1 Tables Structure

```sql
-- Folders table (mirrors storage bucket structure)
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Images table (mirrors storage bucket files)
CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Games table
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id VARCHAR(10) UNIQUE NOT NULL, -- Short ID for URLs (e.g., 'abc123')
  name VARCHAR(255) UNIQUE NOT NULL,
  grid_size VARCHAR(10) NOT NULL, -- '3x3', '4x4', '5x5', '6x6'
  background_image TEXT,
  category VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Function to generate short IDs
CREATE OR REPLACE FUNCTION generate_short_id(length INT DEFAULT 6)
RETURNS TEXT AS $
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$ LANGUAGE plpgsql;

-- Trigger to auto-generate short_id
CREATE OR REPLACE FUNCTION set_short_id()
RETURNS TRIGGER AS $
BEGIN
  NEW.short_id := generate_short_id(6);
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM games WHERE short_id = NEW.short_id) LOOP
    NEW.short_id := generate_short_id(6);
  END LOOP;
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER games_short_id_trigger
BEFORE INSERT ON games
FOR EACH ROW
EXECUTE FUNCTION set_short_id();

-- Game images junction table
CREATE TABLE game_images (
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  image_id UUID REFERENCES images(id) ON DELETE CASCADE,
  position INTEGER,
  PRIMARY KEY (game_id, image_id)
);

-- Background images table
CREATE TABLE background_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2.2 Storage Bucket Structure
```
/bingo-images/
  /1st-2nd-grade/
    /feelings/
      - happy.jpg
      - sad.jpg
    /foods/
      - apple.jpg
      - banana.jpg
    /movements-actions/
      - swim.jpg
      - jump.jpg
  /3rd-grade/
  /4th-grade/
  /5th-grade/
  /6th-grade/
  /backgrounds/
    - deep-sea-aquarium.jpg
    - beach-scene.jpg
```

## 3. Player Page Specifications

### 3.1 Layout Structure
```jsx
<div className="player-page">
  {/* Tools Bar */}
  <div className="tools-bar">
    <button className="tool-hand" />     // Drag mode
    <button className="tool-pencil" />   // Draw mode
    <div className="color-picker">       // Color selection
      <button className="color-red" />
      <button className="color-blue" />
      <button className="color-green" />
      <button className="color-black" />
      <button className="color-yellow" />
    </div>
    <div className="size-slider-container">
      <label htmlFor="pen-size">Size:</label>
      <input 
        type="range" 
        id="pen-size"
        min="1" 
        max="20" 
        defaultValue="5"
        className="pen-size-slider"
      />
      <span className="size-value">5</span>
    </div>
    <button className="tool-eraser" />   // Eraser mode
    <button className="tool-trash" />    // Clear all drawings
  </div>

  {/* Main Content Area */}
  <div className="game-area">
    {/* Left Panel - Image Storage */}
    <div className="image-panel">
      <div className="draggable-images">
        {/* Draggable image items */}
      </div>
    </div>

    {/* Center - Bingo Board */}
    <div className="bingo-board" style={{backgroundImage: selectedBackground}}>
      <div className="grid-container">
        {/* Dynamic grid based on game size */}
      </div>
      <canvas className="drawing-canvas" /> {/* For pen marks */}
    </div>
  </div>
</div>
```

### 3.2 Functional Requirements

#### 3.2.1 Drag and Drop
- Images draggable from left panel to bingo board cells
- Prevent dropping on occupied cells
- Allow dragging images back to the left panel
- Visual feedback during drag operations
- Touch and mouse support

#### 3.2.2 Drawing Tools
- **Hand Tool**: Default mode for dragging images
- **Pencil Tool**: Enables drawing on canvas overlay
- **Color Picker**: 5 predefined colors (red, blue, green, black, yellow)
- **Size Slider**: Adjustable width for both pen and eraser (1-20 pixels)
  - Shows current size value
  - Applies to both pencil and eraser tools
  - Default size: 5 pixels
- **Eraser Tool**: Removes pen marks using selected size
- **Trash Tool**: Clears all drawings from canvas

#### 3.2.2.1 Size Slider Implementation
```javascript
const ToolBar = ({ onToolChange, onColorChange, onSizeChange }) => {
  const [currentSize, setCurrentSize] = useState(5);
  const [activeTool, setActiveTool] = useState('hand');
  
  const handleSizeChange = (e) => {
    const size = parseInt(e.target.value);
    setCurrentSize(size);
    onSizeChange(size);
  };
  
  return (
    <div className="tools-bar">
      {/* Other tools */}
      <div className="size-slider-container">
        <label htmlFor="pen-size">Size:</label>
        <input 
          type="range" 
          id="pen-size"
          min="1" 
          max="20" 
          value={currentSize}
          onChange={handleSizeChange}
          className="pen-size-slider"
        />
        <span className="size-value">{currentSize}px</span>
      </div>
    </div>
  );
};
```

#### 3.2.3 Responsive Design
- Adapt to different screen sizes
- Maintain aspect ratio of bingo grid
- Scale images appropriately
- Touch-optimized for tablets

### 3.3 Player Page Routes
```
/play/[gameId] - Dynamic route using short game ID
```

#### 3.3.1 Game Loading Process
1. Player accesses URL with short game ID (e.g., `/play/abc123`)
2. Player page queries database for game details
3. Fetch game configuration (grid size, background)
4. Fetch associated images from game_images table
5. Initialize game board with fetched data

#### 3.3.2 Example Implementation
```javascript
// pages/play/[gameId].jsx
export async function getServerSideProps({ params }) {
  const { gameId } = params;
  
  // Query database for game details
  const game = await supabase
    .from('games')
    .select(`
      *,
      game_images (
        images (*)
      )
    `)
    .eq('short_id', gameId)
    .single();
    
  return { props: { game } };
}
```

## 4. Admin Page Specifications

### 4.1 Layout Structure
```jsx
<div className="admin-page">
  {/* Row 1 - Saved Games Section */}
  <div className="saved-games-section">
    {/* Left Column - Games List */}
    <div className="games-list-column">
      <h2>Games</h2>
      <select className="category-filter">
        <option value="all">All</option>
        {/* Dynamic categories from root folders */}
      </select>
      <div className="games-list">
        {/* Game items with links and copy buttons */}
      </div>
    </div>

    {/* Middle Column - Game Preview */}
    <div className="game-preview-column">
      <div className="image-grid">
        {/* Selected game's images */}
      </div>
      <div className="action-buttons">
        <button className="delete-btn">Delete</button>
        <button className="edit-btn">Edit</button>
      </div>
    </div>

    {/* Right Column - Game Info */}
    <div className="game-info-column">
      <div className="background-preview">
        {/* Background image preview */}
      </div>
      <div className="grid-size-info">
        {/* Grid size display */}
      </div>
    </div>
  </div>

  {/* Row 2 - Save/Edit Game Section */}
  <div className="edit-game-section">
    {/* Left Column - Folder Tree */}
    <div className="folder-tree-column">
      <h3>Vocabulary Folders</h3>
      <button className="edit-folders-btn">Manage Folders</button>
      <div className="folder-tree">
        {/* Hierarchical folder structure */}
      </div>
    </div>

    {/* Middle Column - Selectable Images */}
    <div className="selectable-images-column">
      <h3>{currentFolderPath}</h3>
      <div className="selectable-grid">
        {/* Images from selected folder */}
      </div>
    </div>

    {/* Right Column - Selected Images */}
    <div className="selected-images-column">
      <h3>Selected Images ({count})</h3>
      <button className="clear-all-btn">Clear All</button>
      <div className="selected-grid">
        {/* Selected images with X buttons */}
      </div>
      <button className="save-game-btn">Save Game</button>
    </div>
  </div>
</div>
```

### 4.2 Functional Requirements

#### 4.2.1 Saved Games Management
- **List Display**: Show all games filtered by category
- **Game Selection**: Highlight selected game and display its images
- **Link Management**: 
  - Display short links: `/play/[shortId]` (e.g., `/play/abc123`)
  - Copy link to clipboard functionality
  - Links are permanently associated with games
- **Game Actions**:
  - Delete game (with confirmation)
  - Edit game (loads into bottom section)
  - Rename game

#### 4.2.2 Game Creation/Editing
- **Folder Navigation**:
  - Expandable/collapsible tree structure
  - Display image count per folder
  - Click to load folder images
- **Image Selection**:
  - Click to select/deselect images
  - Multi-folder selection support
  - Visual selection indicators
- **Selected Images Management**:
  - Display selected count
  - Remove individual images (X button)
  - Clear all selections

#### 4.2.3 Save Game Modal
```jsx
<Modal isOpen={showSaveModal}>
  <h2>Save New Game</h2>
  <form>
    <input 
      type="text" 
      placeholder="Enter game name"
      required
      pattern="[A-Za-z0-9\s\-]+"
    />
    
    <select name="gridSize">
      <option value="3x3">3x3</option>
      <option value="4x4">4x4</option>
      <option value="5x5">5x5</option>
      <option value="6x6">6x6</option>
    </select>
    
    <select name="backgroundImage">
      <option value="">No background</option>
      {/* Dynamic background options */}
    </select>
    
    <select name="category">
      {/* Dynamic categories from root folders */}
    </select>
    
    <div className="selected-count">
      Selected Images: {count} / {gridSpaces} required
    </div>
    
    <button type="submit">Save Game</button>
    <button type="button" onClick={closeModal}>Cancel</button>
  </form>
</Modal>
```

#### 4.2.4 Folder Management Modal
```jsx
<Modal isOpen={showFolderModal} size="large">
  <h2>Manage Folder: {selectedFolder}</h2>
  
  {/* Folder Actions */}
  <div className="folder-actions">
    <button onClick={renameFolder}>
      <EditIcon /> Rename Folder
    </button>
    <button onClick={addSubfolder}>
      <FolderPlusIcon /> Add Subfolder
    </button>
    <button onClick={uploadImages}>
      <UploadIcon /> Upload Images
    </button>
    <button onClick={deleteFolder} className="danger">
      <TrashIcon /> Delete Folder
    </button>
  </div>
  
  {/* Folder Tree Navigation */}
  <div className="folder-navigation">
    <h3>Folder Structure</h3>
    <div className="folder-tree-mini">
      {/* Collapsible folder tree for navigation */}
    </div>
  </div>
  
  {/* Images Management Section */}
  <div className="images-management">
    <div className="images-header">
      <h3>Images in {selectedFolder} ({imageCount})</h3>
      <div className="bulk-actions">
        <button onClick={selectAll}>Select All</button>
        <button onClick={deselectAll}>Deselect All</button>
        <button onClick={deleteSelected} disabled={!hasSelection}>
          Delete Selected ({selectedCount})
        </button>
      </div>
    </div>
    
    <div className="image-management-grid">
      {images.map(image => (
        <div 
          key={image.id} 
          className={`image-item ${pendingChanges[image.id] ? 'has-changes' : ''}`}
        >
          <img src={image.url} alt={image.name} />
          
          {editingImageId === image.id ? (
            <input 
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={() => saveImageName(image.id)}
              onKeyPress={(e) => e.key === 'Enter' && saveImageName(image.id)}
              autoFocus
            />
          ) : (
            <p onClick={() => startEditingImage(image.id, image.name)}>
              {pendingChanges[image.id]?.name || image.name}
            </p>
          )}
          
          <div className="image-actions">
            <button 
              onClick={() => startEditingImage(image.id, image.name)}
              title="Rename image"
            >
              <EditIcon />
            </button>
            <button 
              className={`delete-btn ${pendingChanges[image.id]?.deleted ? 'marked' : ''}`}
              onClick={() => toggleImageDeletion(image.id)}
              title="Delete image"
            >
              <TrashIcon />
            </button>
          </div>
        </div>
      ))}
    </div>
    
    {/* Upload Drop Zone */}
    <div 
      className="upload-dropzone"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <p>Drag and drop images here or click to upload</p>
      <input 
        type="file" 
        multiple 
        accept="image/*"
        onChange={handleFileSelect}
        style={{display: 'none'}}
        ref={fileInputRef}
      />
    </div>
  </div>
  
  {/* Pending Changes Summary */}
  {Object.keys(pendingChanges).length > 0 && (
    <div className="pending-changes-summary">
      <h4>Pending Changes:</h4>
      <ul>
        {Object.entries(pendingChanges).map(([id, changes]) => (
          <li key={id}>
            {changes.deleted && `Delete: ${changes.originalName}`}
            {changes.renamed && `Rename: ${changes.originalName} → ${changes.name}`}
          </li>
        ))}
      </ul>
    </div>
  )}
  
  {/* Modal Actions */}
  <div className="modal-actions">
    <button onClick={cancelAllChanges}>Cancel</button>
    <button 
      onClick={commitAllChanges} 
      className="commit-btn"
      disabled={Object.keys(pendingChanges).length === 0 && !hasNewUploads}
    >
      Commit All Changes
    </button>
  </div>
</Modal>
```

#### 4.2.4.2 Upload Conflict Dialog Component
```jsx
const UploadConflictDialog = ({ 
  isOpen, 
  filename, 
  hasMultipleConflicts,
  onAction 
}) => {
  const [applyToAll, setApplyToAll] = useState(false);
  
  const handleAction = (action) => {
    onAction({ action, applyToAll });
    setApplyToAll(false); // Reset for next use
  };
  
  return (
    <Modal isOpen={isOpen} size="small">
      <div className="conflict-dialog">
        <h3>File Already Exists</h3>
        <p>"{filename}" already exists in this folder.</p>
        <p>What would you like to do?</p>
        
        {hasMultipleConflicts && (
          <div className="apply-to-all">
            <input 
              type="checkbox" 
              id="applyToAll"
              checked={applyToAll}
              onChange={(e) => setApplyToAll(e.target.checked)}
            />
            <label htmlFor="applyToAll">
              Apply this action to all conflicts
            </label>
          </div>
        )}
        
        <div className="dialog-actions">
          <button 
            onClick={() => handleAction('overwrite')}
            className="primary"
          >
            Overwrite
          </button>
          <button 
            onClick={() => handleAction('skip')}
            className="secondary"
          >
            Skip
          </button>
          <button 
            onClick={() => handleAction('cancel')}
            className="cancel"
          >
            Cancel All
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Alternative batch conflict resolution dialog
const BatchUploadConflictDialog = ({ 
  isOpen, 
  conflicts, 
  onResolve 
}) => {
  const [decisions, setDecisions] = useState({});
  
  useEffect(() => {
    // Initialize all conflicts as 'skip' by default
    const initial = {};
    conflicts.forEach(file => {
      initial[file.name] = 'skip';
    });
    setDecisions(initial);
  }, [conflicts]);
  
  const handleResolve = () => {
    onResolve(decisions);
  };
  
  const setAllDecisions = (action) => {
    const newDecisions = {};
    conflicts.forEach(file => {
      newDecisions[file.name] = action;
    });
    setDecisions(newDecisions);
  };
  
  return (
    <Modal isOpen={isOpen} size="medium">
      <div className="batch-conflict-dialog">
        <h3>File Conflicts Detected</h3>
        <p>The following files already exist:</p>
        
        <div className="conflict-list">
          {conflicts.map(file => (
            <div key={file.name} className="conflict-item">
              <span className="filename">{file.name}</span>
              <div className="decision-buttons">
                <label>
                  <input 
                    type="radio" 
                    name={file.name}
                    value="overwrite"
                    checked={decisions[file.name] === 'overwrite'}
                    onChange={() => setDecisions({
                      ...decisions,
                      [file.name]: 'overwrite'
                    })}
                  />
                  Overwrite
                </label>
                <label>
                  <input 
                    type="radio" 
                    name={file.name}
                    value="skip"
                    checked={decisions[file.name] === 'skip'}
                    onChange={() => setDecisions({
                      ...decisions,
                      [file.name]: 'skip'
                    })}
                  />
                  Skip
                </label>
              </div>
            </div>
          ))}
        </div>
        
        <div className="batch-actions">
          <button onClick={() => setAllDecisions('overwrite')}>
            Overwrite All
          </button>
          <button onClick={() => setAllDecisions('skip')}>
            Skip All
          </button>
        </div>
        
        <div className="dialog-actions">
          <button 
            onClick={handleResolve}
            className="primary"
          >
            Continue
          </button>
          <button 
            onClick={() => onResolve(null)}
            className="cancel"
          >
            Cancel Upload
          </button>
        </div>
      </div>
    </Modal>
  );
};
```
```javascript
const FolderManagementModal = ({ folder, isOpen, onClose }) => {
  const [images, setImages] = useState([]);
  const [pendingChanges, setPendingChanges] = useState({});
  const [newUploads, setNewUploads] = useState([]);
  const [editingImageId, setEditingImageId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  
  // Load images when modal opens
  useEffect(() => {
    if (isOpen && folder) {
      loadFolderImages();
      setPendingChanges({});
      setNewUploads([]);
    }
  }, [isOpen, folder]);
  
  const loadFolderImages = async () => {
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .eq('folder_id', folder.id)
      .order('name');
    
    if (data) setImages(data);
  };
  
  // IMAGE RENAME
  const startEditingImage = (imageId, currentName) => {
    setEditingImageId(imageId);
    setEditingName(currentName);
  };
  
  const saveImageName = (imageId) => {
    const image = images.find(img => img.id === imageId);
    if (editingName !== image.name && editingName.trim() !== '') {
      setPendingChanges({
        ...pendingChanges,
        [imageId]: {
          ...pendingChanges[imageId],
          name: editingName.trim(),
          originalName: image.name,
          renamed: true,
          deleted: false
        }
      });
    }
    setEditingImageId(null);
    setEditingName('');
  };
  
  // IMAGE DELETE
  const toggleImageDeletion = (imageId) => {
    const image = images.find(img => img.id === imageId);
    const currentChanges = pendingChanges[imageId] || {};
    
    setPendingChanges({
      ...pendingChanges,
      [imageId]: {
        ...currentChanges,
        deleted: !currentChanges.deleted,
        originalName: image.name
      }
    });
  };
  
  // IMAGE UPLOAD
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };
  
  const processFiles = (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const newUploadItems = imageFiles.map(file => ({
      file,
      id: `new-${Date.now()}-${Math.random()}`,
      name: file.name,
      preview: URL.createObjectURL(file)
    }));
    
    setNewUploads([...newUploads, ...newUploadItems]);
  };
  
  // FOLDER OPERATIONS
  const renameFolder = async () => {
    const newName = prompt('Enter new folder name:', folder.name);
    if (newName && newName !== folder.name) {
      const { error } = await supabase
        .from('folders')
        .update({ name: newName })
        .eq('id', folder.id);
      
      if (!error) {
        toast.success('Folder renamed successfully');
        // Update local state or trigger refresh
      }
    }
  };
  
  const addSubfolder = async () => {
    const subfolderName = prompt('Enter subfolder name:');
    if (subfolderName) {
      const newPath = `${folder.path}/${subfolderName}`;
      const { error } = await supabase
        .from('folders')
        .insert({
          name: subfolderName,
          parent_id: folder.id,
          path: newPath
        });
      
      if (!error) {
        toast.success('Subfolder created successfully');
        // Refresh folder tree
      }
    }
  };
  
  const deleteFolder = async () => {
    const confirmDelete = confirm(
      `Delete folder "${folder.name}" and all its contents? This cannot be undone.`
    );
    
    if (confirmDelete) {
      // Delete from storage and database
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', folder.id);
      
      if (!error) {
        toast.success('Folder deleted successfully');
        onClose();
      }
    }
  };
  
  // COMMIT ALL CHANGES
  const commitAllChanges = async () => {
    setLoading(true);
    const warnings = [];
    
    try {
      // Check for images used in games before processing deletions
      const deletionIds = Object.entries(pendingChanges)
        .filter(([_, changes]) => changes.deleted)
        .map(([id, _]) => id);
      
      if (deletionIds.length > 0) {
        // Check which images are used in games
        const { data: gameUsage } = await supabase
          .from('game_images')
          .select('image_id, games(name)')
          .in('image_id', deletionIds);
        
        if (gameUsage && gameUsage.length > 0) {
          const usedImages = gameUsage.map(usage => {
            const image = images.find(img => img.id === usage.image_id);
            return `"${image.name}" is used in game "${usage.games.name}"`;
          });
          
          const confirmMessage = `Warning: The following images are currently used in games:\n\n${usedImages.join('\n')}\n\nDo you want to continue with deletion? This will remove these images from the games.`;
          
          if (!confirm(confirmMessage)) {
            setLoading(false);
            return;
          }
        }
      }
      
      // Process deletions
      for (const [imageId, changes] of Object.entries(pendingChanges)) {
        if (changes.deleted) {
          const image = images.find(img => img.id === imageId);
          
          // Delete from storage
          const { error: storageError } = await supabase.storage
            .from('bingo-images')
            .remove([image.storage_path]);
          
          if (!storageError) {
            // Delete from database (will cascade delete from game_images)
            await supabase
              .from('images')
              .delete()
              .eq('id', imageId);
          } else {
            warnings.push(`Failed to delete "${image.name}" from storage`);
          }
        }
      }
      
      // Process renames
      for (const [imageId, changes] of Object.entries(pendingChanges)) {
        if (changes.renamed && !changes.deleted) {
          const image = images.find(img => img.id === imageId);
          const oldPath = image.storage_path;
          const newPath = oldPath.replace(image.name, changes.name);
          
          // Copy to new name in storage
          const { error: copyError } = await supabase.storage
            .from('bingo-images')
            .copy(oldPath, newPath);
          
          if (!copyError) {
            // Update database
            await supabase
              .from('images')
              .update({ 
                name: changes.name,
                storage_path: newPath,
                url: image.url.replace(image.name, changes.name)
              })
              .eq('id', imageId);
            
            // Delete old file from storage
            await supabase.storage
              .from('bingo-images')
              .remove([oldPath]);
          } else {
            warnings.push(`Failed to rename "${image.name}"`);
          }
        }
      }
      
      // Process uploads with conflict handling
      if (newUploads.length > 0) {
        // Check for existing files
        const uploadNames = newUploads.map(u => u.name);
        const { data: existingImages } = await supabase
          .from('images')
          .select('name')
          .eq('folder_id', folder.id)
          .in('name', uploadNames);
        
        const existingNames = existingImages?.map(img => img.name) || [];
        const conflicts = newUploads.filter(upload => existingNames.includes(upload.name));
        
        let overwriteDecision = null; // null = ask each time, 'all' = overwrite all, 'none' = skip all
        
        for (const upload of newUploads) {
          const filePath = `${folder.path}/${upload.name}`;
          const isConflict = existingNames.includes(upload.name);
          
          if (isConflict) {
            let shouldOverwrite = false;
            
            if (overwriteDecision === 'all') {
              shouldOverwrite = true;
            } else if (overwriteDecision === 'none') {
              warnings.push(`Skipped "${upload.name}" - already exists`);
              continue;
            } else {
              // Show dialog with options
              const result = await showConflictDialog(upload.name, conflicts.length > 1);
              
              if (result.action === 'overwrite') {
                shouldOverwrite = true;
                if (result.applyToAll) overwriteDecision = 'all';
              } else if (result.action === 'skip') {
                if (result.applyToAll) overwriteDecision = 'none';
                warnings.push(`Skipped "${upload.name}" - already exists`);
                continue;
              } else {
                // Cancel was pressed
                setLoading(false);
                return;
              }
            }
            
            if (!shouldOverwrite) continue;
          }
          
          // Upload to storage (with upsert if overwriting)
          const { error: uploadError } = await supabase.storage
            .from('bingo-images')
            .upload(filePath, upload.file, { 
              upsert: isConflict 
            });
          
          if (!uploadError) {
            // Get public URL
            const { data: urlData } = supabase.storage
              .from('bingo-images')
              .getPublicUrl(filePath);
            
            // Insert or update in database
            if (isConflict) {
              await supabase
                .from('images')
                .update({
                  url: urlData.publicUrl,
                  updated_at: new Date().toISOString()
                })
                .eq('folder_id', folder.id)
                .eq('name', upload.name);
            } else {
              await supabase
                .from('images')
                .insert({
                  folder_id: folder.id,
                  name: upload.name,
                  storage_path: filePath,
                  url: urlData.publicUrl
                });
            }
          } else {
            warnings.push(`Failed to upload "${upload.name}"`);
          }
        }
      }
      
      // Show results
      if (warnings.length > 0) {
        toast.warning(`Completed with warnings: ${warnings.join(', ')}`);
      } else {
        toast.success('All changes committed successfully');
      }
      
      // Refresh and reset
      await loadFolderImages();
      setPendingChanges({});
      setNewUploads([]);
      
    } catch (error) {
      console.error('Error committing changes:', error);
      toast.error('Failed to commit some changes');
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to show conflict dialog
  const showConflictDialog = (filename, hasMultiple) => {
    return new Promise((resolve) => {
      // In a real implementation, this would be a custom modal
      // For now, using a simplified approach
      const message = `"${filename}" already exists in this folder.\n\nWhat would you like to do?`;
      const options = hasMultiple ? 
        '\n\n[OK] = Overwrite\n[Cancel] = Skip\n\n' +
        'Hold Shift when clicking to apply to all remaining conflicts.' :
        '\n\n[OK] = Overwrite\n[Cancel] = Skip';
      
      if (confirm(message + options)) {
        // Check if shift key is held (in real implementation, this would be in the modal)
        resolve({ 
          action: 'overwrite', 
          applyToAll: false // Would check shift key in real implementation
        });
      } else {
        resolve({ 
          action: 'skip', 
          applyToAll: false 
        });
      }
    });
  };
  
  const cancelAllChanges = () => {
    setPendingChanges({});
    setNewUploads([]);
    setEditingImageId(null);
    onClose();
  };
  
  return (
    <Modal isOpen={isOpen} onClose={cancelAllChanges}>
      {/* Modal content as shown above */}
    </Modal>
  );
};
```

## 5. API Endpoints

### 5.1 Game Management
```javascript
// Games
GET    /api/games              // List all games
GET    /api/games/:shortId     // Get game by short ID
POST   /api/games              // Create new game
PUT    /api/games/:id          // Update game
DELETE /api/games/:id          // Delete game

// Game Images
GET    /api/games/:shortId/images   // Get game images by short ID
PUT    /api/games/:id/images        // Update game images

// Player Page Data Loading
GET    /api/play/:shortId      // Get complete game data for player page
Response: {
  id: string,
  shortId: string,
  name: string,
  gridSize: string,
  backgroundImage: string,
  images: [{
    id: string,
    name: string,
    url: string
  }]
}
```

### 5.2 Folder Management
```javascript
// Folders
GET    /api/folders            // Get folder tree
POST   /api/folders            // Create folder
PUT    /api/folders/:id        // Rename folder
DELETE /api/folders/:id        // Delete folder (cascade delete contents)

// Images
GET    /api/folders/:id/images // Get folder images
POST   /api/images/upload      // Upload images
PUT    /api/images/:id         // Rename image
DELETE /api/images/:id         // Delete single image
DELETE /api/images/batch       // Delete multiple images

// Batch operations
POST   /api/folders/:id/batch-operations
Body: {
  operations: [
    { type: 'rename', imageId: 'uuid1', newName: 'new-name.jpg' },
    { type: 'delete', imageId: 'uuid2' },
    { type: 'upload', file: File, name: 'uploaded.jpg' }
  ]
}

// Check image usage before deletion
GET    /api/images/:id/usage   // Returns games using this image
```

## 6. Component Structure

### 6.1 File Organization
```
/src
  /components
    /player
      - BingoBoard.jsx
      - DrawingCanvas.jsx
      - ImagePanel.jsx
      - ToolBar.jsx
    /admin
      - SavedGames.jsx
      - FolderTree.jsx
      - ImageGrid.jsx
      - SaveGameModal.jsx
      - FolderManagementModal.jsx
    /shared
      - DraggableImage.jsx
      - Modal.jsx
      - Button.jsx
  /pages
    - index.jsx (Admin page)
    - play/[gameId].jsx (Player page)
  /lib
    - supabase.js
    - api.js
  /hooks
    - useDragDrop.js
    - useCanvas.js
    - useGame.js
  /styles
    - globals.css
```

### 6.2 Key Components

#### 6.2.1 BingoBoard Component
```jsx
const BingoBoard = ({ gridSize, backgroundImage, gameImages }) => {
  // Grid rendering logic
  // Drop zone management
  // Cell occupation tracking
};
```

#### 6.2.2 DrawingCanvas Component
```jsx
const DrawingCanvas = ({ tool, color, size, onClear }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    setIsDrawing(true);
    
    if (tool === 'pencil') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
    } else if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = size;
    }
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    
    const rect = canvas.getBoundingClientRect();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };
  
  const draw = (e) => {
    if (!isDrawing || tool === 'hand') return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };
  
  const stopDrawing = () => {
    setIsDrawing(false);
  };
  
  return (
    <canvas 
      ref={canvasRef}
      className="drawing-canvas"
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
    />
  );
};
```

#### 6.2.3 FolderTree Component
```jsx
const FolderTree = ({ folders, onFolderSelect, onEdit }) => {
  // Recursive folder rendering
  // Expand/collapse state
  // Image count display
};
```

## 7. State Management

### 7.1 Player Page State
```javascript
{
  loading: boolean, // Loading state while fetching from database
  error: string | null,
  gameData: {
    id: string,
    shortId: string,
    name: string,
    gridSize: string,
    backgroundImage: string,
    images: Array // Fetched from database
  },
  boardState: {
    cells: Array, // Track occupied cells
    availableImages: Array,
    placedImages: Map // cellId -> imageId
  },
  toolState: {
    activeTool: 'hand' | 'pencil' | 'eraser',
    activeColor: string,
    penSize: number, // 1-20 pixels
    canvasData: ImageData
  }
}
```

#### 7.1.1 Player Page Loading Flow
```javascript
// Player page component
const PlayerPage = ({ shortId }) => {
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch game data from database using short ID
    fetchGameData(shortId).then(data => {
      setGameData(data);
      setLoading(false);
    });
  }, [shortId]);
  
  if (loading) return <LoadingSpinner />;
  if (!gameData) return <GameNotFound />;
  
  return <BingoGame gameData={gameData} />;
};
```

### 7.2 Admin Page State
```javascript
{
  savedGames: {
    list: Array,
    selectedGame: Object,
    filter: string
  },
  folderTree: {
    folders: Array,
    selectedFolder: string,
    expandedFolders: Set
  },
  imageSelection: {
    availableImages: Array,
    selectedImages: Array,
    currentFolderPath: string
  },
  modals: {
    saveGameOpen: boolean,
    folderEditOpen: boolean,
    gameData: Object
  }
}
```

## 8. Security & Validation

### 8.1 Input Validation
- Game names: Alphanumeric with spaces and hyphens
- Grid size validation against selected images
- File upload: Image types only (jpg, png, gif)
- Maximum file size: 5MB per image
- Image deletion: Warning shown if images are used in games

### 8.2 Access Control
- No authentication required for player page
- Consider adding teacher authentication for admin page (future enhancement)
- Rate limiting for API endpoints
- CORS configuration for allowed origins

### 8.3 Data Integrity
- Warn users before deleting images used in games
- Allow deletion with user confirmation
- Cascade deletions update game_images table
- Maintain storage bucket and database synchronization
- Transaction support for multi-step operations

## 9. Performance Optimizations

### 9.1 Image Handling
- Lazy loading for folder images
- Image compression on upload
- Thumbnail generation for grid displays
- CDN integration via Supabase

### 9.2 Caching Strategy
- Cache folder structure
- Cache game data for frequently accessed games
- Implement service worker for offline gameplay

## 10. Deployment Instructions

### 10.1 Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://klyxwfqsqzcwfvygyppd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
```

### 10.2 Replit Configuration
```json
{
  "run": "npm run dev",
  "entrypoint": "src/pages/index.jsx",
  "hidden": [".config", "package-lock.json"],
  "env": {
    "NODE_ENV": "development"
  }
}
```

### 10.3 Build Commands
```bash
# Development
npm run dev

# Production build
npm run build
npm run start

# Deploy to Vercel
vercel --prod
```

## 11. Testing Requirements

### 11.1 Unit Tests
- Component rendering tests
- Drag and drop functionality
- API endpoint tests
- State management tests
- Drawing tools with size variations

### 11.2 Integration Tests
- Game creation flow
- Player gameplay flow
- File upload process
- Cross-browser compatibility
- Pen/eraser size slider functionality

### 11.3 User Acceptance Criteria
- Teacher can create game in < 2 minutes
- Students can access game via link without login
- Drag and drop works on tablets
- Drawing tools function on touch devices
- Pen and eraser sizes are easily adjustable
- Size changes are immediately reflected in drawing
- Games load in < 3 seconds

### 11.4 Drawing Tools Test Cases
- Verify pen width changes from 1-20 pixels
- Verify eraser width matches pen size setting
- Ensure size slider works on touch devices
- Confirm size value display updates in real-time
- Test that size setting persists when switching between pen and eraser

## 12. Future Enhancements

### 12.1 Phase 2 Features
- **TTS (Text-to-Speech) Integration**
  - Associate audio files with each image
  - Play vocabulary pronunciation on image click/hover
  - Support for multiple audio formats (mp3, wav)
  - Volume control in player interface
  
- **TTS Batch Processing**
  - Bulk generate TTS files for existing images
  - Auto-generate based on image filename
  - Support for multiple languages/voices
  - Admin interface for managing TTS generation
  
- **Custom Drawing Shapes**
  - Additional marking tools (stars, checks, circles)
  - Stamp tools for quick marking
  
- **Multi-language Support**
  - Interface translations
  - Multiple TTS languages per image

### 12.2 Phase 3 Features
- **Student Writing Feature**
  - Drawing/writing area below each bingo cell
  - Text input option for typing vocabulary
  - Save student work for teacher review
  - Practice mode vs. game mode
  
- **Enhanced Media Support**
  - Video clips for vocabulary
  - GIF animation support
  - Multiple images per vocabulary item
  
- **Student Progress Tracking**
  - Save completed bingo boards
  - Track which words students struggled with
  - Generate practice recommendations

### 12.3 Technical Enhancements
- **TTS Implementation Details**
  - Store audio files in Supabase storage bucket
  - Link audio files to images in database
  - Preload audio for smooth playback
  - Fallback to browser TTS API if files unavailable
  
- **Writing Feature Implementation**
  - Separate canvas layer for student writing
  - OCR capability for handwriting recognition
  - Save written responses as images
  - Compare student writing to correct spelling