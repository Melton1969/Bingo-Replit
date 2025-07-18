import { useState, useEffect } from 'react';
import { gameAPI } from '../lib/api';

export const useGame = (shortId) => {
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!shortId) return;

    const loadGame = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const game = await gameAPI.getGameByShortId(shortId);
        
        // Transform the data structure for easier use
        const transformedGame = {
          ...game,
          images: game.game_images?.map(gi => gi.images) || []
        };
        
        setGameData(transformedGame);
      } catch (err) {
        console.error('Error loading game:', err);
        setError(err.message || 'Failed to load game');
      } finally {
        setLoading(false);
      }
    };

    loadGame();
  }, [shortId]);

  return { gameData, loading, error };
};

export const useGames = (categoryFilter = null) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadGames = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const gamesData = await gameAPI.getAllGames(categoryFilter);
      setGames(gamesData);
    } catch (err) {
      console.error('Error loading games:', err);
      setError(err.message || 'Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, [categoryFilter]);

  const deleteGame = async (gameId) => {
    try {
      await gameAPI.deleteGame(gameId);
      setGames(prev => prev.filter(game => game.id !== gameId));
    } catch (err) {
      console.error('Error deleting game:', err);
      throw err;
    }
  };

  const createGame = async (gameData) => {
    try {
      const newGame = await gameAPI.createGame(gameData);
      setGames(prev => [newGame, ...prev]);
      return newGame;
    } catch (err) {
      console.error('Error creating game:', err);
      throw err;
    }
  };

  return { 
    games, 
    loading, 
    error, 
    deleteGame, 
    createGame,
    refreshGames: loadGames 
  };
};