import { supabase } from './supabase';

// Game Management API
export const gameAPI = {
  // Get all games
  getAllGames: async (categoryFilter = null) => {
    let query = supabase
      .from('games')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (categoryFilter && categoryFilter !== 'all') {
      query = query.eq('category', categoryFilter);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get game by short ID (for player page)
  getGameByShortId: async (shortId) => {
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        game_images (
          images (*)
        )
      `)
      .eq('short_id', shortId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new game
  createGame: async (gameData) => {
    const { data, error } = await supabase
      .from('games')
      .insert([gameData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update game
  updateGame: async (gameId, gameData) => {
    const { data, error } = await supabase
      .from('games')
      .update(gameData)
      .eq('id', gameId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete game
  deleteGame: async (gameId) => {
    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', gameId);
    
    if (error) throw error;
  },

  // Update game images
  updateGameImages: async (gameId, imageIds) => {
    // First delete existing game images
    await supabase
      .from('game_images')
      .delete()
      .eq('game_id', gameId);
    
    // Insert new game images
    const gameImages = imageIds.map((imageId, index) => ({
      game_id: gameId,
      image_id: imageId,
      position: index
    }));
    
    const { error } = await supabase
      .from('game_images')
      .insert(gameImages);
    
    if (error) throw error;
  }
};

// Folder Management API
export const folderAPI = {
  // Get folder tree
  getFolderTree: async () => {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .order('path');
    
    if (error) throw error;
    return data;
  },

  // Get folder images
  getFolderImages: async (folderId) => {
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .eq('folder_id', folderId)
      .order('name');
    
    if (error) throw error;
    return data;
  },

  // Create folder
  createFolder: async (folderData) => {
    const { data, error } = await supabase
      .from('folders')
      .insert([folderData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update folder
  updateFolder: async (folderId, folderData) => {
    const { data, error } = await supabase
      .from('folders')
      .update(folderData)
      .eq('id', folderId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete folder
  deleteFolder: async (folderId) => {
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', folderId);
    
    if (error) throw error;
  }
};

// Image Management API
export const imageAPI = {
  // Upload image
  uploadImage: async (file, folderPath) => {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${folderPath}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('bingo-images')
      .upload(filePath, file);
    
    if (error) throw error;
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('bingo-images')
      .getPublicUrl(filePath);
    
    return {
      path: filePath,
      url: urlData.publicUrl,
      fileName
    };
  },

  // Create image record
  createImage: async (imageData) => {
    const { data, error } = await supabase
      .from('images')
      .insert([imageData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update image
  updateImage: async (imageId, imageData) => {
    const { data, error } = await supabase
      .from('images')
      .update(imageData)
      .eq('id', imageId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete image
  deleteImage: async (imageId) => {
    // First get image details
    const { data: image, error: fetchError } = await supabase
      .from('images')
      .select('storage_path')
      .eq('id', imageId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('bingo-images')
      .remove([image.storage_path]);
    
    if (storageError) throw storageError;
    
    // Delete from database
    const { error } = await supabase
      .from('images')
      .delete()
      .eq('id', imageId);
    
    if (error) throw error;
  },

  // Check image usage in games
  checkImageUsage: async (imageId) => {
    const { data, error } = await supabase
      .from('game_images')
      .select('games(name)')
      .eq('image_id', imageId);
    
    if (error) throw error;
    return data;
  }
};

// Background Images API
export const backgroundAPI = {
  // Get all background images
  getAllBackgrounds: async () => {
    const { data, error } = await supabase
      .from('background_images')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  }
};