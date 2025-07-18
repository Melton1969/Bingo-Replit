import formidable from 'formidable';
import { imageAPI } from '../../../lib/api';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable({
    maxFileSize: 5 * 1024 * 1024, // 5MB limit
    keepExtensions: true,
    filter: ({ mimetype }) => {
      // Only allow images
      return mimetype && mimetype.startsWith('image/');
    },
  });

  try {
    const [fields, files] = await form.parse(req);
    
    const folderId = fields.folderId?.[0];
    const folderPath = fields.folderPath?.[0];
    
    if (!folderId || !folderPath) {
      return res.status(400).json({ error: 'Missing folderId or folderPath' });
    }

    const uploadedFiles = Array.isArray(files.images) ? files.images : [files.images];
    const results = [];
    const errors = [];

    for (const file of uploadedFiles) {
      if (!file) continue;

      try {
        // Upload to Supabase storage
        const uploadResult = await imageAPI.uploadImage(file, folderPath);
        
        // Create image record in database
        const imageRecord = await imageAPI.createImage({
          folder_id: folderId,
          name: uploadResult.fileName,
          url: uploadResult.url,
          storage_path: uploadResult.path
        });

        results.push(imageRecord);
      } catch (error) {
        console.error('Error uploading file:', file.originalFilename, error);
        errors.push({
          filename: file.originalFilename,
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      uploaded: results,
      errors: errors
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
}