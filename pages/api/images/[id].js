import { imageAPI } from '../../../lib/api';
import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  try {
    switch (method) {
      case 'GET':
        // Get image details
        const { data, error } = await supabase
          .from('images')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Image not found' });
        
        res.status(200).json(data);
        break;

      case 'PUT':
        // Update image (rename)
        const { name } = req.body;
        
        if (!name) {
          return res.status(400).json({ error: 'Name is required' });
        }

        const updatedImage = await imageAPI.updateImage(id, { name });
        res.status(200).json(updatedImage);
        break;

      case 'DELETE':
        // Check if image is used in games first
        const usage = await imageAPI.checkImageUsage(id);
        
        if (usage.length > 0) {
          return res.status(400).json({ 
            error: 'Cannot delete image that is used in games',
            usage: usage
          });
        }

        await imageAPI.deleteImage(id);
        res.status(204).end();
        break;

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Image API error:', error);
    res.status(500).json({ error: error.message });
  }
}