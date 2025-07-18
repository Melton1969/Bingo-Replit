import { gameAPI } from '../../../lib/api';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  try {
    switch (method) {
      case 'GET':
        const game = await gameAPI.getGameByShortId(id);
        if (!game) {
          return res.status(404).json({ error: 'Game not found' });
        }
        res.status(200).json(game);
        break;

      case 'PUT':
        const { name, grid_size, background_image, category, image_ids } = req.body;
        
        const updatedGame = await gameAPI.updateGame(id, {
          name,
          grid_size,
          background_image,
          category
        });

        if (image_ids) {
          await gameAPI.updateGameImages(id, image_ids);
        }

        res.status(200).json(updatedGame);
        break;

      case 'DELETE':
        await gameAPI.deleteGame(id);
        res.status(204).end();
        break;

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Game API error:', error);
    res.status(500).json({ error: error.message });
  }
}