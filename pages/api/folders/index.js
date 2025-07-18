import { folderAPI } from '../../../lib/api';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        const folders = await folderAPI.getFolderTree();
        res.status(200).json(folders);
        break;

      case 'POST':
        const { name, parent_id, path } = req.body;
        
        if (!name || !path) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const newFolder = await folderAPI.createFolder({
          name,
          parent_id,
          path
        });

        res.status(201).json(newFolder);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Folders API error:', error);
    res.status(500).json({ error: error.message });
  }
}