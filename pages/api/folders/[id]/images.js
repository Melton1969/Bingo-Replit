import { folderAPI } from '../../../../lib/api';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  try {
    switch (method) {
      case 'GET':
        const images = await folderAPI.getFolderImages(id);
        res.status(200).json(images);
        break;

      default:
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Folder images API error:', error);
    res.status(500).json({ error: error.message });
  }
}