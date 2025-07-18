import { backgroundAPI } from '../../../lib/api';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        const backgrounds = await backgroundAPI.getAllBackgrounds();
        res.status(200).json(backgrounds);
        break;

      default:
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Backgrounds API error:', error);
    res.status(500).json({ error: error.message });
  }
}