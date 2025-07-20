-- Bingo Web App Database Schema - FIXED VERSION
-- Execute this SQL in your Supabase SQL editor

-- Folders table (mirrors storage bucket structure)
CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  path TEXT NOT NULL UNIQUE, -- Added UNIQUE constraint for ON CONFLICT
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Images table (mirrors storage bucket files)
CREATE TABLE IF NOT EXISTS images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE, -- Added UNIQUE constraint
  created_at TIMESTAMP DEFAULT NOW()
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(255) UNIQUE NOT NULL,
  grid_size VARCHAR(10) NOT NULL, -- '3x3', '4x4', '5x5', '6x6'
  background_image TEXT,
  category VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Function to generate short IDs
CREATE OR REPLACE FUNCTION generate_short_id(length INT DEFAULT 6)
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate short_id
CREATE OR REPLACE FUNCTION set_short_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.short_id IS NULL THEN
    NEW.short_id := generate_short_id(6);
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM games WHERE short_id = NEW.short_id) LOOP
      NEW.short_id := generate_short_id(6);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for games table
DROP TRIGGER IF EXISTS games_short_id_trigger ON games;
CREATE TRIGGER games_short_id_trigger
BEFORE INSERT ON games
FOR EACH ROW
EXECUTE FUNCTION set_short_id();

-- Game images junction table
CREATE TABLE IF NOT EXISTS game_images (
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  image_id UUID REFERENCES images(id) ON DELETE CASCADE,
  position INTEGER,
  PRIMARY KEY (game_id, image_id)
);

-- Background images table
CREATE TABLE IF NOT EXISTS background_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE, -- Added UNIQUE constraint
  url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample background images
INSERT INTO background_images (name, url) VALUES
  ('Beach Scene', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop'),
  ('Deep Sea Aquarium', 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=1200&h=800&fit=crop'),
  ('Ocean Waves', 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1200&h=800&fit=crop'),
  ('Underwater Coral', 'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=1200&h=800&fit=crop')
ON CONFLICT (name) DO NOTHING;

-- Insert sample folder structure
INSERT INTO folders (name, parent_id, path) VALUES
  ('1st-2nd-grade', NULL, '1st-2nd-grade'),
  ('3rd-grade', NULL, '3rd-grade'),
  ('4th-grade', NULL, '4th-grade'),
  ('5th-grade', NULL, '5th-grade'),
  ('6th-grade', NULL, '6th-grade'),
  ('backgrounds', NULL, 'backgrounds')
ON CONFLICT (path) DO NOTHING;

-- Insert subfolders for 1st-2nd-grade
INSERT INTO folders (name, parent_id, path) VALUES
  ('feelings', (SELECT id FROM folders WHERE path = '1st-2nd-grade'), '1st-2nd-grade/feelings'),
  ('foods', (SELECT id FROM folders WHERE path = '1st-2nd-grade'), '1st-2nd-grade/foods'),
  ('movements-actions', (SELECT id FROM folders WHERE path = '1st-2nd-grade'), '1st-2nd-grade/movements-actions')
ON CONFLICT (path) DO NOTHING;

-- Insert subfolders for 3rd-grade
INSERT INTO folders (name, parent_id, path) VALUES
  ('Unit-2-feelings-gestures', (SELECT id FROM folders WHERE path = '3rd-grade'), '3rd-grade/Unit-2-feelings-gestures'),
  ('Unit-3-how-many', (SELECT id FROM folders WHERE path = '3rd-grade'), '3rd-grade/Unit-3-how-many')
ON CONFLICT (path) DO NOTHING;

-- Insert subfolders for Unit-3-how-many
INSERT INTO folders (name, parent_id, path) VALUES
  ('pg10-various-objects', (SELECT id FROM folders WHERE path = '3rd-grade/Unit-3-how-many'), '3rd-grade/Unit-3-how-many/pg10-various-objects')
ON CONFLICT (path) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_folders_path ON folders(path);
CREATE INDEX IF NOT EXISTS idx_images_folder_id ON images(folder_id);
CREATE INDEX IF NOT EXISTS idx_games_short_id ON games(short_id);
CREATE INDEX IF NOT EXISTS idx_games_category ON games(category);
CREATE INDEX IF NOT EXISTS idx_game_images_game_id ON game_images(game_id);
CREATE INDEX IF NOT EXISTS idx_game_images_image_id ON game_images(image_id);

-- Enable Row Level Security (RLS)
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_images ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for production)
CREATE POLICY "Allow public read access on folders" ON folders FOR SELECT USING (true);
CREATE POLICY "Allow public read access on images" ON images FOR SELECT USING (true);
CREATE POLICY "Allow public read access on games" ON games FOR SELECT USING (true);
CREATE POLICY "Allow public read access on game_images" ON game_images FOR SELECT USING (true);
CREATE POLICY "Allow public read access on background_images" ON background_images FOR SELECT USING (true);

-- For now, allow all operations (remove in production)
CREATE POLICY "Allow all operations on folders" ON folders FOR ALL USING (true);
CREATE POLICY "Allow all operations on images" ON images FOR ALL USING (true);
CREATE POLICY "Allow all operations on games" ON games FOR ALL USING (true);
CREATE POLICY "Allow all operations on game_images" ON game_images FOR ALL USING (true);
CREATE POLICY "Allow all operations on background_images" ON background_images FOR ALL USING (true);

-- Storage bucket creation (run this separately in Supabase Dashboard > Storage)
-- CREATE BUCKET IF NOT EXISTS 'bingo-images' WITH (public = true);

-- Create storage policies for public access to images
-- Note: Run these in the Supabase Dashboard > Storage > Policies section
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'bingo-images');
-- CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'bingo-images');
-- CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING (bucket_id = 'bingo-images');
-- CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (bucket_id = 'bingo-images');