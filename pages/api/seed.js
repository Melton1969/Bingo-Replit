import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if data already exists
    const { data: existingGames } = await supabase
      .from('games')
      .select('id')
      .limit(1);

    if (existingGames && existingGames.length > 0) {
      return res.status(200).json({ 
        message: 'Database already seeded', 
        existing: true 
      });
    }

    // Seed folders
    const { data: folders, error: folderError } = await supabase
      .from('folders')
      .insert([
        { name: '1st-2nd-grade', parent_id: null, path: '1st-2nd-grade' },
        { name: '3rd-grade', parent_id: null, path: '3rd-grade' },
        { name: '4th-grade', parent_id: null, path: '4th-grade' },
        { name: '5th-grade', parent_id: null, path: '5th-grade' },
        { name: '6th-grade', parent_id: null, path: '6th-grade' },
        { name: 'backgrounds', parent_id: null, path: 'backgrounds' }
      ])
      .select();

    if (folderError) throw folderError;

    // Get folder IDs
    const firstGradeFolder = folders.find(f => f.name === '1st-2nd-grade');
    const thirdGradeFolder = folders.find(f => f.name === '3rd-grade');

    // Seed subfolders
    const { data: subfolders, error: subfolderError } = await supabase
      .from('folders')
      .insert([
        { name: 'foods', parent_id: firstGradeFolder.id, path: '1st-2nd-grade/foods' },
        { name: 'feelings', parent_id: firstGradeFolder.id, path: '1st-2nd-grade/feelings' },
        { name: 'movements-actions', parent_id: firstGradeFolder.id, path: '1st-2nd-grade/movements-actions' },
        { name: 'Unit-3-how-many', parent_id: thirdGradeFolder.id, path: '3rd-grade/Unit-3-how-many' }
      ])
      .select();

    if (subfolderError) throw subfolderError;

    // Get subfolder IDs
    const foodsFolder = subfolders.find(f => f.name === 'foods');
    const feelingsFolder = subfolders.find(f => f.name === 'feelings');
    const unit3Folder = subfolders.find(f => f.name === 'Unit-3-how-many');

    // Seed test images (using placeholder URLs for now)
    const { data: images, error: imageError } = await supabase
      .from('images')
      .insert([
        // Foods folder
        { 
          folder_id: foodsFolder.id, 
          name: 'apple.jpg', 
          url: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200&h=200&fit=crop&crop=center',
          storage_path: '1st-2nd-grade/foods/apple.jpg' 
        },
        { 
          folder_id: foodsFolder.id, 
          name: 'banana.jpg', 
          url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop&crop=center',
          storage_path: '1st-2nd-grade/foods/banana.jpg' 
        },
        { 
          folder_id: foodsFolder.id, 
          name: 'bread.jpg', 
          url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop&crop=center',
          storage_path: '1st-2nd-grade/foods/bread.jpg' 
        },
        { 
          folder_id: foodsFolder.id, 
          name: 'egg.jpg', 
          url: 'https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=200&h=200&fit=crop&crop=center',
          storage_path: '1st-2nd-grade/foods/egg.jpg' 
        },
        { 
          folder_id: foodsFolder.id, 
          name: 'fish.jpg', 
          url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200&h=200&fit=crop&crop=center',
          storage_path: '1st-2nd-grade/foods/fish.jpg' 
        },
        { 
          folder_id: foodsFolder.id, 
          name: 'salad.jpg', 
          url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop&crop=center',
          storage_path: '1st-2nd-grade/foods/salad.jpg' 
        },
        { 
          folder_id: foodsFolder.id, 
          name: 'sandwich.jpg', 
          url: 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=200&h=200&fit=crop&crop=center',
          storage_path: '1st-2nd-grade/foods/sandwich.jpg' 
        },
        { 
          folder_id: foodsFolder.id, 
          name: 'spaghetti.jpg', 
          url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=200&h=200&fit=crop&crop=center',
          storage_path: '1st-2nd-grade/foods/spaghetti.jpg' 
        },
        { 
          folder_id: foodsFolder.id, 
          name: 'steak.jpg', 
          url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&h=200&fit=crop&crop=center',
          storage_path: '1st-2nd-grade/foods/steak.jpg' 
        },
        
        // Feelings folder
        { 
          folder_id: feelingsFolder.id, 
          name: 'happy.jpg', 
          url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
          storage_path: '1st-2nd-grade/feelings/happy.jpg' 
        },
        { 
          folder_id: feelingsFolder.id, 
          name: 'sad.jpg', 
          url: 'https://images.unsplash.com/photo-1584999734482-0361aecad844?w=200&h=200&fit=crop&crop=face',
          storage_path: '1st-2nd-grade/feelings/sad.jpg' 
        },
        { 
          folder_id: feelingsFolder.id, 
          name: 'angry.jpg', 
          url: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=200&h=200&fit=crop&crop=face',
          storage_path: '1st-2nd-grade/feelings/angry.jpg' 
        },
        
        // Unit-3 folder
        { 
          folder_id: unit3Folder.id, 
          name: 'blocks.jpg', 
          url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop&crop=center',
          storage_path: '3rd-grade/Unit-3-how-many/blocks.jpg' 
        },
        { 
          folder_id: unit3Folder.id, 
          name: 'pencils.jpg', 
          url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=200&h=200&fit=crop&crop=center',
          storage_path: '3rd-grade/Unit-3-how-many/pencils.jpg' 
        },
        { 
          folder_id: unit3Folder.id, 
          name: 'balls.jpg', 
          url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&crop=center',
          storage_path: '3rd-grade/Unit-3-how-many/balls.jpg' 
        }
      ])
      .select();

    if (imageError) throw imageError;

    // Seed background images
    const { data: backgrounds, error: backgroundError } = await supabase
      .from('background_images')
      .insert([
        { 
          name: 'Beach Scene', 
          url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop' 
        },
        { 
          name: 'Deep Sea Aquarium', 
          url: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=1200&h=800&fit=crop' 
        },
        { 
          name: 'Ocean Waves', 
          url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1200&h=800&fit=crop' 
        }
      ])
      .select();

    if (backgroundError) throw backgroundError;

    // Seed test games
    const { data: games, error: gameError } = await supabase
      .from('games')
      .insert([
        {
          name: 'Foods (3x3)',
          grid_size: '3x3',
          background_image: backgrounds[0].url,
          category: '1st-2nd-grade'
        },
        {
          name: 'Feelings Test',
          grid_size: '4x4',
          background_image: backgrounds[1].url,
          category: '1st-2nd-grade'
        },
        {
          name: 'Unit 3 Objects',
          grid_size: '3x3',
          background_image: backgrounds[2].url,
          category: '3rd-grade'
        }
      ])
      .select();

    if (gameError) throw gameError;

    // Link images to games
    const foodImages = images.filter(img => img.folder_id === foodsFolder.id).slice(0, 9);
    const feelingImages = images.filter(img => img.folder_id === feelingsFolder.id);
    const unit3Images = images.filter(img => img.folder_id === unit3Folder.id);

    // Foods game
    const { error: gameImageError1 } = await supabase
      .from('game_images')
      .insert(
        foodImages.map((img, index) => ({
          game_id: games[0].id,
          image_id: img.id,
          position: index
        }))
      );

    if (gameImageError1) throw gameImageError1;

    // Feelings game
    const { error: gameImageError2 } = await supabase
      .from('game_images')
      .insert(
        feelingImages.map((img, index) => ({
          game_id: games[1].id,
          image_id: img.id,
          position: index
        }))
      );

    if (gameImageError2) throw gameImageError2;

    // Unit 3 game
    const { error: gameImageError3 } = await supabase
      .from('game_images')
      .insert(
        unit3Images.map((img, index) => ({
          game_id: games[2].id,
          image_id: img.id,
          position: index
        }))
      );

    if (gameImageError3) throw gameImageError3;

    res.status(200).json({
      message: 'Database seeded successfully',
      data: {
        folders: folders.length + subfolders.length,
        images: images.length,
        backgrounds: backgrounds.length,
        games: games.length
      }
    });

  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({ error: error.message });
  }
}