import { imageAPI } from '../../../lib/api';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageIds } = req.body;

  if (!imageIds || !Array.isArray(imageIds)) {
    return res.status(400).json({ error: 'imageIds array is required' });
  }

  try {
    const results = [];
    const errors = [];

    for (const imageId of imageIds) {
      try {
        // Check if image is used in games
        const usage = await imageAPI.checkImageUsage(imageId);
        
        if (usage.length > 0) {
          errors.push({
            imageId,
            error: 'Image is used in games',
            usage: usage
          });
          continue;
        }

        await imageAPI.deleteImage(imageId);
        results.push(imageId);
      } catch (error) {
        console.error('Error deleting image:', imageId, error);
        errors.push({
          imageId,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      deleted: results,
      errors: errors
    });

  } catch (error) {
    console.error('Batch delete error:', error);
    res.status(500).json({ error: 'Failed to delete images' });
  }
}