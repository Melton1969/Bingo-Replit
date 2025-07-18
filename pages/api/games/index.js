import { gameAPI } from '../../../lib/api';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        const { category } = req.query;
        const games = await gameAPI.getAllGames(category);
        res.status(200).json(games);
        break;

      case 'POST':
        const { name, grid_size, background_image, category, image_ids } = req.body;
        
        // Validate required fields
        if (!name || !grid_size || !category || !image_ids) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create game
        const newGame = await gameAPI.createGame({
          name,
          grid_size,
          background_image,
          category
        });

        // Add images to game
        if (image_ids && image_ids.length > 0) {
          await gameAPI.updateGameImages(newGame.id, image_ids);
        }

        res.status(201).json(newGame);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Games API error:', error);
    res.status(500).json({ error: error.message });
  }
}